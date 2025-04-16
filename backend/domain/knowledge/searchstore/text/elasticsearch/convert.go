package elasticsearch

import "strconv"

func stringifyDocumentIDs(documentIDs []int64) []string {
	resp := make([]string, len(documentIDs))
	for i := range documentIDs {
		resp[i] = strconv.FormatInt(documentIDs[i], 10)
	}
	return resp
}
