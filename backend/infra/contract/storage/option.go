package storage

type Opt func(option *Option)

type Option struct {
	Expire int64 //  seconds
}

func WithExpire(expire int64) Opt {
	return func(o *Option) {
		o.Expire = expire
	}
}
