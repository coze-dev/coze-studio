package langfuse

// see: https://langfuse.com/docs/opentelemetry/get-started#property-mapping

// namespace: langfuse.*

const (
	AttributeSessionID     = "langfuse.session.id" // string
	AttributeUserID        = "langfuse.user.id"    // string
	AttributePublic        = "langfuse.public"
	AttributeRelease       = "langfuse.release"
	AttributeVersion       = "langfuse.version"
	AttributeTags          = "langfuse.tags"
	AttributePromptName    = "langfuse.prompt.name"
	AttributePromptVersion = "langfuse.prompt.version"
	AttributeEnvironment   = "langfuse.environment"
	AttributeMetaData      = "langfuse.metadata"
)
