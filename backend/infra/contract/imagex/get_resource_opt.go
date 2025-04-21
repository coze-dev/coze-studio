package imagex

type GetResourceOpt func(option *GetResourceOption)

type GetResourceOption struct {
	Format   string
	Template string
	Proto    string
	Expire   int
}

func WithResourceFormat(format string) GetResourceOpt {
	return func(o *GetResourceOption) {
		o.Format = format
	}
}

func WithResourceTemplate(template string) GetResourceOpt {
	return func(o *GetResourceOption) {
		o.Template = template
	}
}

func WithResourceProto(proto string) GetResourceOpt {
	return func(o *GetResourceOption) {
		o.Proto = proto
	}
}

func WithResourceExpire(expire int) GetResourceOpt {
	return func(o *GetResourceOption) {
		o.Expire = expire
	}
}
