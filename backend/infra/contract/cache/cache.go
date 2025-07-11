/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package cache

import (
	"context"
	"time"

	"code.byted.org/kv/goredis"
	redis "code.byted.org/kv/redis-v6"
)

// type Cmdable = redis.Cmdable

type Cmdable interface {
	Pipeline() *goredis.Pipeline
	WithContext(ctx context.Context) *goredis.Client
	ClientGetName() *redis.StringCmd
	Echo(message interface{}) *redis.StringCmd
	Ping() *redis.StatusCmd
	Quit() *redis.StatusCmd
	Del(keys ...string) *redis.IntCmd
	Unlink(keys ...string) *redis.IntCmd
	Dump(key string) *redis.StringCmd
	Exists(keys ...string) *redis.IntCmd
	Expire(key string, expiration time.Duration) *redis.BoolCmd
	ExpireAt(key string, tm time.Time) *redis.BoolCmd
	Keys(pattern string) *redis.StringSliceCmd
	Migrate(host, port, key string, db int64, timeout time.Duration) *redis.StatusCmd
	Move(key string, db int64) *redis.BoolCmd
	ObjectRefCount(key string) *redis.IntCmd
	ObjectEncoding(key string) *redis.StringCmd
	ObjectIdleTime(key string) *redis.DurationCmd
	Persist(key string) *redis.BoolCmd
	PExpire(key string, expiration time.Duration) *redis.BoolCmd
	PExpireAt(key string, tm time.Time) *redis.BoolCmd
	PTTL(key string) *redis.DurationCmd
	RandomKey() *redis.StringCmd
	Rename(key, newkey string) *redis.StatusCmd
	RenameNX(key, newkey string) *redis.BoolCmd
	Restore(key string, ttl time.Duration, value string) *redis.StatusCmd
	RestoreReplace(key string, ttl time.Duration, value string) *redis.StatusCmd
	Sort(key string, sort redis.Sort) *redis.StringSliceCmd
	SortInterfaces(key string, sort redis.Sort) *redis.SliceCmd
	TTL(key string) *redis.DurationCmd
	HTTL(key string) *redis.DurationCmd
	ZTTL(key string) *redis.DurationCmd
	LTTL(key string) *redis.DurationCmd
	STTL(key string) *redis.DurationCmd
	Type(key string) *redis.StatusCmd
	GetShardCount() *redis.IntCmd
	IScan(shard uint64, cursor string, match string, count int64) *redis.IScanCmd
	Scan(cursor uint64, match string, count int64) *redis.ScanCmd
	SScan(key string, cursor uint64, match string, count int64) *redis.ScanCmd
	ScanSet(key string, cursor string, count int64) *redis.ScanWithStringCursorCmd
	HScan(key string, cursor uint64, match string, count int64) *redis.ScanCmd
	ScanHash(key string, cursor string, count int64) *redis.ScanWithStringCursorCmd
	ZScan(key string, cursor uint64, match string, count int64) *redis.ScanCmd
	Append(key, value string) *redis.IntCmd
	BitCount(key string, bitCount *redis.BitCount) *redis.IntCmd
	BitOpAnd(destKey string, keys ...string) *redis.IntCmd
	BitOpOr(destKey string, keys ...string) *redis.IntCmd
	BitOpXor(destKey string, keys ...string) *redis.IntCmd
	BitOpNot(destKey string, key string) *redis.IntCmd
	BitPos(key string, bit int64, pos ...int64) *redis.IntCmd
	Decr(key string) *redis.IntCmd
	DecrExpire(key string, expiration time.Duration) *redis.IntCmd
	DecrBy(key string, decrement int64) *redis.IntCmd
	DecrByExpire(key string, decrement int64, expiration time.Duration) *redis.IntCmd
	XDecrBy(key string, decrement int64) *redis.IntCmd
	Get(key string) *redis.StringCmd
	CGet(key string) *redis.IntCmd
	DpsAddKey(key string) *redis.StatusCmd
	GetBit(key string, offset int64) *redis.IntCmd
	GetRange(key string, start, end int64) *redis.StringCmd
	GetSet(key string, value interface{}) *redis.StringCmd
	Incr(key string) *redis.IntCmd
	IncrExpire(key string, expiration time.Duration) *redis.IntCmd
	CIncr(key string) *redis.IntCmd
	IncrBy(key string, value int64) *redis.IntCmd
	IncrByExpire(key string, value int64, expiration time.Duration) *redis.IntCmd
	CIncrBy(key string, value int64) *redis.IntCmd
	IncrByFloat(key string, value float64) *redis.FloatCmd
	AlIncrBy(key string, value int64) *redis.IntCmd
	MGet(keys ...string) *redis.SliceCmd
	CMGet(keys ...string) *redis.SliceCmd
	MSet(pairs ...interface{}) *redis.StatusCmd
	MSetNX(pairs ...interface{}) *redis.BoolCmd
	Set(key string, value interface{}, expiration time.Duration) *redis.StatusCmd
	CSet(key string, value int64, expiration time.Duration) *redis.StatusCmd
	CasEx(key string, oldvalue interface{}, newvalue interface{}, expiration time.Duration) *redis.IntCmd
	Cas(key string, oldvalue interface{}, newvalue interface{}) *redis.IntCmd
	Cas2(key string, oldvalue interface{}, newvalue interface{}, expiration time.Duration) *redis.IntCmd
	Cas2NX(key string, oldvalue interface{}, newvalue interface{}, expiration time.Duration) *redis.IntCmd
	Cad(key string, value interface{}) *redis.IntCmd
	SetBit(key string, offset int64, value int) *redis.IntCmd
	SetNX(key string, value interface{}, expiration time.Duration) *redis.BoolCmd
	SetXX(key string, value interface{}, expiration time.Duration) *redis.BoolCmd
	SetRange(key string, offset int64, value string) *redis.IntCmd
	StrLen(key string) *redis.IntCmd
	HDel(key string, fields ...string) *redis.IntCmd
	HExists(key, field string) *redis.BoolCmd
	HGet(key, field string) *redis.StringCmd
	HGetAll(key string) *redis.StringStringMapCmd
	HIncrBy(key, field string, incr int64) *redis.IntCmd
	HXDecrBy(key, field string, decrement int64) *redis.IntCmd
	HIncrByFloat(key, field string, incr float64) *redis.FloatCmd
	AlHIncrBy(key, field string, incr int64) *redis.IntCmd
	HKeys(key string) *redis.StringSliceCmd
	HLen(key string) *redis.IntCmd
	HMGet(key string, fields ...string) *redis.SliceCmd
	HMSet(key string, fields map[string]interface{}) *redis.StatusCmd
	HMIncrBy(key string, fields map[string]int64) *redis.IntSliceCmd
	HMXDecrBy(key string, fields map[string]int64) *redis.IntSliceCmd
	HSet(key, field string, value interface{}) *redis.BoolCmd
	HSetNX(key, field string, value interface{}) *redis.BoolCmd
	HVals(key string) *redis.StringSliceCmd
	HGetSet(key, field string, value interface{}) *redis.StringCmd
	BLPop(timeout time.Duration, keys ...string) *redis.StringSliceCmd
	BRPop(timeout time.Duration, keys ...string) *redis.StringSliceCmd
	BRPopLPush(source, destination string, timeout time.Duration) *redis.StringCmd
	LIndex(key string, index int64) *redis.StringCmd
	LInsert(key, op string, pivot, value interface{}) *redis.IntCmd
	LInsertBefore(key string, pivot, value interface{}) *redis.IntCmd
	LInsertAfter(key string, pivot, value interface{}) *redis.IntCmd
	LLen(key string) *redis.IntCmd
	LPop(key string) *redis.StringCmd
	LPush(key string, values ...interface{}) *redis.IntCmd
	LPushX(key string, value interface{}) *redis.IntCmd
	LRange(key string, start, stop int64) *redis.StringSliceCmd
	LRem(key string, count int64, value interface{}) *redis.IntCmd
	LSet(key string, index int64, value interface{}) *redis.StatusCmd
	LTrim(key string, start, stop int64) *redis.StatusCmd
	RPop(key string) *redis.StringCmd
	RPopLPush(source, destination string) *redis.StringCmd
	RPush(key string, values ...interface{}) *redis.IntCmd
	RPushX(key string, value interface{}) *redis.IntCmd
	SAdd(key string, members ...interface{}) *redis.IntCmd
	SCard(key string) *redis.IntCmd
	SDiff(keys ...string) *redis.StringSliceCmd
	SDiffStore(destination string, keys ...string) *redis.IntCmd
	SInter(keys ...string) *redis.StringSliceCmd
	SInterStore(destination string, keys ...string) *redis.IntCmd
	SIsMember(key string, member interface{}) *redis.BoolCmd
	SMembers(key string) *redis.StringSliceCmd
	SMove(source, destination string, member interface{}) *redis.BoolCmd
	SPop(key string) *redis.StringCmd
	SPopN(key string, count int64) *redis.StringSliceCmd
	SRandMember(key string) *redis.StringCmd
	SRandMemberN(key string, count int64) *redis.StringSliceCmd
	SRem(key string, members ...interface{}) *redis.IntCmd
	SUnion(keys ...string) *redis.StringSliceCmd
	SUnionStore(destination string, keys ...string) *redis.IntCmd
	XGet(key string) *redis.XGetCmd
	XSet(key string, value interface{}, generation int64, expiration time.Duration) *redis.XSetCmd
	ScanRow(key string, limit int, offset int, target string) *redis.ScanRowCmd
	TtlQPush(key string, ttl time.Duration, item []byte) *redis.IntCmd
	TtlQPopTo(key string, cursor int64) *redis.StatusCmd
	TtlQDelete(key string) *redis.StatusCmd
	TtlQLen(key string) *redis.IntCmd
	TtlQScan(key string, startCursor, endCursor, limit int64) *redis.TtlQScanCmd
	TtlQGet(key string, cursor int64) *redis.StringCmd
	TtlQGetLatestCursor(key string) *redis.IntCmd
	TtlQGetMeta(key string) *redis.TtlQMetaCmd
	TtlQExists(key string) *redis.BoolCmd
	HDrop(keys string) *redis.IntCmd
	ZDrop(keys string) *redis.IntCmd
	LDrop(keys string) *redis.IntCmd
	SDrop(keys string) *redis.IntCmd
	ZAdd(key string, members ...redis.Z) *redis.IntCmd
	ZAddNX(key string, members ...redis.Z) *redis.IntCmd
	ZAddXX(key string, members ...redis.Z) *redis.IntCmd
	ZAddCh(key string, members ...redis.Z) *redis.IntCmd
	ZAddNXCh(key string, members ...redis.Z) *redis.IntCmd
	ZAddXXCh(key string, members ...redis.Z) *redis.IntCmd
	ZIncr(key string, member redis.Z) *redis.FloatCmd
	ZIncrNX(key string, member redis.Z) *redis.FloatCmd
	ZIncrXX(key string, member redis.Z) *redis.FloatCmd
	ZAddWithLimit(key string, limit int64, members ...redis.Z) *redis.IntCmd
	ZIncrWithLimit(key string, limit int64, member redis.Z) *redis.FloatCmd
	ZCard(key string) *redis.IntCmd
	ZCount(key, min, max string) *redis.IntCmd
	ZLexCount(key, min, max string) *redis.IntCmd
	ZIncrBy(key string, increment float64, member string) *redis.FloatCmd
	ZInterStore(destination string, store redis.ZStore, keys ...string) *redis.IntCmd
	ZRange(key string, start, stop int64) *redis.StringSliceCmd
	ZRangeWithScores(key string, start, stop int64) *redis.ZSliceCmd
	ZRangeByScore(key string, opt redis.ZRangeBy) *redis.StringSliceCmd
	ZRangeByLex(key string, opt redis.ZRangeBy) *redis.StringSliceCmd
	ZRangeByScoreWithScores(key string, opt redis.ZRangeBy) *redis.ZSliceCmd
	ZRank(key, member string) *redis.IntCmd
	ZRem(key string, members ...interface{}) *redis.IntCmd
	ZRemRangeByRank(key string, start, stop int64) *redis.IntCmd
	ZRemRangeByScore(key, min, max string) *redis.IntCmd
	ZRemRangeByLex(key, min, max string) *redis.IntCmd
	ZRevRange(key string, start, stop int64) *redis.StringSliceCmd
	ZRevRangeWithScores(key string, start, stop int64) *redis.ZSliceCmd
	ZRevRangeByScore(key string, opt redis.ZRangeBy) *redis.StringSliceCmd
	ZRevRangeByLex(key string, opt redis.ZRangeBy) *redis.StringSliceCmd
	ZRevRangeByScoreWithScores(key string, opt redis.ZRangeBy) *redis.ZSliceCmd
	ZRevRank(key, member string) *redis.IntCmd
	ZScore(key, member string) *redis.FloatCmd
	ZUnionStore(dest string, store redis.ZStore, keys ...string) *redis.IntCmd
	ZPopMax(key string, count uint64) *redis.ZSliceCmd
	ZPopMin(key string, count uint64) *redis.ZSliceCmd
	PFAdd(key string, els ...interface{}) *redis.IntCmd
	PFCount(keys ...string) *redis.IntCmd
	PFMerge(dest string, keys ...string) *redis.StatusCmd
	BgRewriteAOF() *redis.StatusCmd
	BgSave() *redis.StatusCmd
	AlchemyBgSave() *redis.SliceCmd
	ClientKill(ipPort string) *redis.StatusCmd
	ClientList() *redis.StringCmd
	ClientPause(dur time.Duration) *redis.BoolCmd
	ConfigGet(parameter string) *redis.SliceCmd
	ConfigResetStat() *redis.StatusCmd
	ConfigSet(parameter, value string) *redis.StatusCmd
	DBSize() *redis.IntCmd
	FlushAll() *redis.StatusCmd
	FlushAllAsync() *redis.StatusCmd
	FlushDB() *redis.StatusCmd
	FlushDBAsync() *redis.StatusCmd
	Info(section ...string) *redis.StringCmd
	LastSave() *redis.IntCmd
	Save() *redis.StatusCmd
	Shutdown() *redis.StatusCmd
	ShutdownSave() *redis.StatusCmd
	ShutdownNoSave() *redis.StatusCmd
	SlaveOf(host, port string) *redis.StatusCmd
	Time() *redis.TimeCmd
	Eval(script string, keys []string, args ...interface{}) *redis.Cmd
	EvalSha(sha1 string, keys []string, args ...interface{}) *redis.Cmd
	ScriptExists(scripts ...string) *redis.BoolSliceCmd
	ScriptFlush() *redis.StatusCmd
	ScriptKill() *redis.StatusCmd
	ScriptLoad(script string) *redis.StringCmd
	DebugObject(key string) *redis.StringCmd
	PubSubChannels(pattern string) *redis.StringSliceCmd
	PubSubNumSub(channels ...string) *redis.StringIntMapCmd
	PubSubNumPat() *redis.IntCmd
	ClusterSlots() *redis.ClusterSlotsCmd
	ClusterNodes() *redis.StringCmd
	ClusterMeet(host, port string) *redis.StatusCmd
	ClusterForget(nodeID string) *redis.StatusCmd
	ClusterReplicate(nodeID string) *redis.StatusCmd
	ClusterResetSoft() *redis.StatusCmd
	ClusterResetHard() *redis.StatusCmd
	ClusterInfo() *redis.StringCmd
	ClusterKeySlot(key string) *redis.IntCmd
	ClusterCountFailureReports(nodeID string) *redis.IntCmd
	ClusterCountKeysInSlot(slot int) *redis.IntCmd
	ClusterDelSlots(slots ...int) *redis.StatusCmd
	ClusterDelSlotsRange(min, max int) *redis.StatusCmd
	ClusterSaveConfig() *redis.StatusCmd
	ClusterSlaves(nodeID string) *redis.StringSliceCmd
	ClusterFailover() *redis.StatusCmd
	ClusterAddSlots(slots ...int) *redis.StatusCmd
	ClusterAddSlotsRange(min, max int) *redis.StatusCmd
	GeoAdd(key string, geoLocation ...*redis.GeoLocation) *redis.IntCmd
	GeoPos(key string, members ...string) *redis.GeoPosCmd
	GeoRadius(key string, longitude, latitude float64, query *redis.GeoRadiusQuery) *redis.GeoLocationCmd
	GeoRadiusRO(key string, longitude, latitude float64, query *redis.GeoRadiusQuery) *redis.GeoLocationCmd
	GeoRadiusByMember(key, member string, query *redis.GeoRadiusQuery) *redis.GeoLocationCmd
	GeoRadiusByMemberRO(key, member string, query *redis.GeoRadiusQuery) *redis.GeoLocationCmd
	GeoDist(key string, member1, member2, unit string) *redis.FloatCmd
	GeoHash(key string, members ...string) *redis.StringSliceCmd
	Command() *redis.CommandsInfoCmd
	Raw(args ...string) *redis.Cmd
	/* Abase special command */
	HashExists(key string) *redis.BoolCmd
	SExists(key string) *redis.BoolCmd
	LExists(key string) *redis.BoolCmd
	ZExists(key string) *redis.BoolCmd
	HSetExpire(key string, expiration time.Duration) *redis.BoolCmd
	LSetExpire(key string, expiration time.Duration) *redis.BoolCmd
	SSetExpire(key string, expiration time.Duration) *redis.BoolCmd
	ZSetExpire(key string, expiration time.Duration) *redis.BoolCmd
	HSetExpires(key string, expiration time.Duration) *redis.BoolCmd
	LSetExpires(key string, expiration time.Duration) *redis.BoolCmd
	SSetExpires(key string, expiration time.Duration) *redis.BoolCmd
	ZSetExpires(key string, expiration time.Duration) *redis.BoolCmd
	IPSAdd(key string, content string) *redis.StringCmd
	IPSBatchQuery(key string, content string) *redis.StringCmd
	IPSMigrateAdd(key string, content string) *redis.StringCmd
	IPSLoad(key string, content string) *redis.StringCmd
	IPSDel(key string, content string) *redis.StringCmd
}
