package signal

import (
	"os"
	"os/signal"
	"syscall"
)

func WaitExit() {
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGINT, syscall.SIGHUP, syscall.SIGTERM)
	<-signals
}
