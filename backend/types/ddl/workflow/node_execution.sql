create table opencoze.node_execution
(
    id                   bigint unsigned  not null comment 'node execution id'
        primary key,
    execute_id           bigint unsigned  not null comment 'the workflow execute id this node execution belongs to',
    node_id              varchar(128)     not null comment 'node key',
    node_name            varchar(128)     not null comment 'name of the node',
    node_type            varchar(128)     not null comment 'the type of the node, in string',
    created_at           bigint unsigned  not null comment 'create time in millisecond',
    status               tinyint unsigned not null comment '1=waiting 2=running 3=success 4=fail',
    duration             bigint unsigned  null comment 'execution duration in millisecond',
    input                mediumtext       null comment 'actual input of the node',
    output               mediumtext       null comment 'actual output of the node',
    raw_output           mediumtext       null comment 'the original output of the node',
    error_info           mediumtext       null comment 'error info',
    error_level          varchar(32)      null comment 'level of the error',
    input_tokens         bigint unsigned  null comment 'number of input tokens',
    output_tokens        bigint unsigned  null comment 'number of output tokens',
    updated_at           bigint unsigned  null comment 'update time in millisecond',
    composite_node_index bigint unsigned  null comment 'loop or batch''s execution index',
    composite_node_items mediumtext       null comment 'the items extracted from parent composite node for this index',
    parent_node_id       varchar(128)     null comment 'when as inner node for loop or batch, this is the parent node''s key'
);

create index idx_execute_id_node_id
    on opencoze.node_execution (execute_id, node_id);

create index idx_execute_id_parent_node_id
    on opencoze.node_execution (execute_id, parent_node_id);

