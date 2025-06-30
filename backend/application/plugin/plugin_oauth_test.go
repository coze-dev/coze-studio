package plugin

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"sync"
	"testing"
	"time"
)

var (
	// 内存存储授权码和令牌
	codeStore  = make(map[string]string) // code -> client_id
	tokenStore = make(map[string]string) // token -> client_id
	mu         sync.Mutex
)

// 生成随机字符串
func generateCode() string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	b := make([]rune, 20)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

// 授权端点 /authorize
// 简化：用户同意授权后，重定向到 redirect_uri 并附带授权码
func authorizeHandler(w http.ResponseWriter, r *http.Request) {
	clientID := r.URL.Query().Get("client_id")
	redirectURI := r.URL.Query().Get("redirect_uri")
	state := r.URL.Query().Get("state")

	if clientID == "" || redirectURI == "" {
		http.Error(w, "missing client_id or redirect_uri", http.StatusBadRequest)
		return
	}

	// 模拟用户授权同意
	code := generateCode()

	// 保存授权码和对应客户端
	mu.Lock()
	codeStore[code] = clientID
	mu.Unlock()

	// 构造重定向 URL
	v := url.Values{}
	v.Set("code", code)
	if state != "" {
		v.Set("state", state)
	}
	redirectURL := redirectURI + "?" + v.Encode()

	http.Redirect(w, r, redirectURL, http.StatusFound)
}

// 令牌端点 /token
// 接收授权码，返回访问令牌
func tokenHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	grantType := r.Form.Get("grant_type")
	code := r.Form.Get("code")
	clientID := r.Form.Get("client_id")

	if grantType != "authorization_code" || code == "" || clientID == "" {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	mu.Lock()
	storedClientID, ok := codeStore[code]
	if !ok || storedClientID != clientID {
		mu.Unlock()
		http.Error(w, "invalid code", http.StatusBadRequest)
		return
	}
	// 删除授权码，防止重用
	delete(codeStore, code)

	// 生成访问令牌
	token := generateCode()
	tokenStore[token] = clientID
	mu.Unlock()

	resp := map[string]interface{}{
		"access_token":  token,
		"refresh_token": token,
		"expires_in":    3,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func TestOauth(t *testing.T) {
	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/authorize", authorizeHandler)
	http.HandleFunc("/token", tokenHandler)

	log.Println("OAuth2 server started at :6000")
	log.Fatal(http.ListenAndServe("localhost:6000", nil))
}
