import { type TreeSelectProps as COZTreeSelectProps } from './components/tree-select';
import { type TooltipProps as CozTooltipProps } from './components/tooltip';
import { type ToastProps as CozToastProps } from './components/toast';
import { type TextAreaProps as CozTextAreaProps } from './components/textarea';
import { type TagProps as CozTagProps } from './components/tag';
import type {
  TableProps as CozTableProps,
  TableMethods as CozTableMethods,
  TableMetaProps as CozTableMetaProps,
  TableActionProps as CozTableActionProps,
} from './components/table';
import {
  type TabsTopProps as CozTabsTopProps,
  type TabsBarProps as CozTabsBarProps,
  type TabsBarPanelProps as CozTabsBarPanelProps,
} from './components/tab-bar';
import { type SwitchProps as CozSwitchProps } from './components/switch';
import { type SelectProps as CozSelectProps } from './components/select';
import { type SearchProps as CozSearchProps } from './components/search';
import {
  type RadioProps as CozRadioProps,
  type RadioGroupProps as CozRadioGroupProps,
} from './components/radio';
import { type ProgressProps as CozProgressProps } from './components/progress';
import { type PopoverProps as CozPopoverProps } from './components/popover';
import { type PopconfirmProps as CozPopconfirmProps } from './components/popconfirm';
import { type ModalProps as CozModalProps } from './components/modal';
import { type MenuProps as CozMenuProps } from './components/menu';
import { type LoadingProps as CozLoadingProps } from './components/loading';
import { type LayoutProps as CozLayoutProps } from './components/layout';
import { type InputNumberProps as CozInputNumberProps } from './components/input-number';
import { type InputCodeProps as CozInputCodeProps } from './components/input-code';
import { type InputProps as CozInputProps } from './components/input';
import { type EmptyStateProps as CozEmptyStateProps } from './components/empty-state';
import { type DatePickerProps as CozDatePickerProps } from './components/date-picker';
import { type CollapsibleProps as CozCollapsibleProps } from './components/collapsible';
import { type CollapseProps as CozCollapseProps } from './components/collapse';
import { type CheckboxProps as CozCheckboxProps } from './components/checkbox';
import { type CascaderProps as CozCascaderProps } from './components/cascader';
import {
  type ButtonProps as CozButtonProps,
  type LoadingButtonProps as CozLoadingButtonProps,
  type AIButtonProps as CozAIButtonProps,
  type SplitButtonProps as CozSplitButtonProps,
} from './components/button';
import { type BreadcrumbProps as CozBreadcrumbProps } from './components/breadcrumb';
import { type BannerProps as CozBannerProps } from './components/banner';
import { type BadgeProps as CozBadgeProps } from './components/badge';
import { type AvatarProps as CozAvatarProps } from './components/avatar';

export { Avatar as CozAvatar } from './components/avatar';
export type AvatarProps = CozAvatarProps;

export { Badge } from './components/badge';
export type BadgeProps = CozBadgeProps;

export {
  Button,
  IconButton,
  LoadingButton,
  AIButton,
  SplitButton,
} from './components/button';

export type ButtonProps = CozButtonProps;
export type LoadingButtonProps = CozLoadingButtonProps;
export type AIButtonProps = CozAIButtonProps;
export type SplitButtonProps = CozSplitButtonProps;

// 仅做微调，可以直接覆盖原有semi Step组件
export {
  Step as CozStep,
  Steps as CozSteps,
  type StepProps as CozStepProps,
  type StepsProps as CozStepsProps,
} from './components/step';

export {
  Pagination as CozPagination,
  type PaginationProps as CozPaginationProps,
} from './components/pagination';

export { Loading } from './components/loading';
export type LoadingProps = CozLoadingProps;

export { Menu } from './components/menu';
export type MenuProps = CozMenuProps;

export { Menu as Dropdown } from './components/menu';
export type DropdownProps = CozMenuProps;

export { Checkbox } from './components/checkbox';
export type CheckboxProps = CozCheckboxProps;

export { Banner } from './components/banner';
export type BannerProps = CozBannerProps;

export { Toast } from './components/toast';
export type ToastProps = CozToastProps;

export { Tag } from './components/tag';
export type TagProps = CozTagProps;

export {
  Chip,
  type ChipProps,
  type IChipStyle,
  type IChipColor,
} from './components/chip';

export { Tooltip } from './components/tooltip';
export type TooltipProps = CozTooltipProps;

export { Radio, RadioGroup } from './components/radio';
export type RadioProps = CozRadioProps;
export type RadioGroupProps = CozRadioGroupProps;

export { Collapse } from './components/collapse';
export type CollapseProps = CozCollapseProps;

export { Collapsible } from './components/collapsible';
export type CollapsibleProps = CozCollapsibleProps;

export { Popover } from './components/popover';
export type PopoverProps = CozPopoverProps;

export { TimePicker, type TimePickerProps } from './components/time-picker';

export { Select } from './components/select';
export type SelectProps = CozSelectProps;

export { Modal } from './components/modal';
export type ModalProps = CozModalProps;

export { Switch } from './components/switch';
export type SwitchProps = CozSwitchProps;

// 新样式 CozInputNumber 逐步替换
export { InputNumber, CozInputNumber } from './components/input-number';
export type InputNumberProps = CozInputNumberProps;

export { Input } from './components/input';
export { InputOld } from './components/input/input-old';
export type InputProps = CozInputProps;

export { Search, SearchInput } from './components/search';
export type SearchProps = CozSearchProps;

export { TextArea } from './components/textarea';
export type TextAreaProps = CozTextAreaProps;

export { Table } from './components/table';
export type TableProps = CozTableProps;
export type TableMethods = CozTableMethods;
export type TableMetaProps = CozTableMetaProps;
export type TableActionProps = CozTableActionProps;

export { Popconfirm } from './components/popconfirm';
export type PopconfirmProps = CozPopconfirmProps;

export { EmptyState } from './components/empty-state';
export type EmptyStateProps = CozEmptyStateProps;

export { InputCode } from './components/input-code';
export type InputCodeProps = CozInputCodeProps;

export { Breadcrumb } from './components/breadcrumb';
export type BreadcrumbProps = CozBreadcrumbProps;

export { Layout } from './components/layout';
export type LayoutProps = CozLayoutProps;

export { DatePicker } from './components/date-picker';
export type DatePickerProps = CozDatePickerProps;
export { type BaseDatePicker } from '@douyinfe/semi-ui/lib/es/datePicker';

export { TreeSelect } from './components/tree-select';
export type TreeSelectProps = COZTreeSelectProps;

export { Cascader } from './components/cascader';
export type CascaderProps = CozCascaderProps;

export { SegmentTab, type SegmentTabProps } from './components/segment-tab';

export {
  SingleSelect,
  type SingleSelectProps,
} from './components/single-select';

export {
  Typography,
  type TypographyProps,
  type TextProps,
  type Ellipsis,
} from './components/typography';

export { Progress } from './components/progress';
export type ProgressProps = CozProgressProps;

export { TabBar } from './components/tab-bar';
export type TabsTopProps = CozTabsTopProps;
export type TabsBarProps = CozTabsBarProps;
export type TabsBarPanelProps = CozTabsBarPanelProps;

export {
  ThemeProvider,
  useTheme,
  type ThemeProviderProps,
  type Theme,
} from './components/theme';

export {
  FormInput,
  FormSelect,
  FormTextArea,
  FormUpload,
  FormInputNumber,
} from './components/form';

// #region fixme 社会化场景需求临时导出代码
export { MenuSubMenu } from './components/menu/menu-sub-menu';
export { MenuItem } from './components/menu/menu-item';
export type { MenuItemProps } from './components/menu';
// #endregion

/*原生semi组件透传*/
export {
  Anchor,
  AutoComplete,
  Avatar,
  AvatarGroup,
  BackTop,
  ButtonGroup,
  Calendar,
  Card,
  CardGroup,
  Carousel,
  CheckboxGroup,
  ConfigProvider,
  Descriptions,
  Divider,
  Empty,
  Row,
  Col,
  List,
  Icon,
  InputGroup,
  Nav,
  NavItem,
  SubNav,
  Notification,
  OverflowList,
  Pagination,
  Rating,
  ScrollList,
  ScrollItem,
  SideSheet,
  Skeleton,
  Slider,
  Space,
  Spin,
  SplitButtonGroup,
  Step,
  Steps,
  Tabs,
  TabPane,
  TagGroup,
  TagInput,
  Timeline,
  Tree,
  Upload,
  Transfer,
  Highlight,
  LocaleProvider,
  LocaleConsumer,
  Form,
  useFormApi,
  useFormState,
  useFieldApi,
  useFieldState,
  withFormState,
  withFormApi,
  withField,
  ArrayField,
  Image,
  ImagePreview,
  Button as SemiButton,
  Select as SemiSelect,
  Cascader as SemiCascader,
} from './components/semi';

/*原生semi props 透传*/
export type {
  AutoCompleteProps,
  customRequestArgs,
  BackTopProps,
  LinkProps,
  AnchorProps,
  CalendarProps,
  CardProps,
  DescriptionsProps,
  DescriptionsItemProps,
  UploadProps,
  FormApi,
  BaseFormProps,
  CommonFieldProps,
  ColumnProps,
  DividerProps,
  ListProps,
  ListItemProps,
  SpaceProps,
  optionRenderProps,
  OptionProps,
  NoticeReactProps,
  OverflowListProps,
  TabsProps,
  TabPaneProps,
  PaginationProps,
  RatingProps,
  SkeletonProps,
  StepProps,
  StepsProps,
  TransferProps,
  HighlightProps,
  ImageProps,
  TimelineProps,
  TimelineItemProps,
  ScrollItemProps,
  ScrollListProps,
  ArrayFieldProps,
  InputGroupProps,
  NavProps,
  DropDownMenuItem,
  DropDownMenuItemItem,
  DropDownMenuItemTitle,
  DropDownMenuItemDivider,
  RadioChangeEvent,
  CascaderData,
  FilterRenderProps,
  LabelProps,
  RadioOptionItem,
  RenderFileItemProps,
  RuleItem,
  FormState,
  FileItem,
  TreeNodeData,
  RenderSelectedItemFn,
  SideSheetReactProps,
  SliderProps,
} from './components/semi/types';

/*原生semi locale*/
export { enUS, zhCN } from './components/semi/locale';
export {
  fgThemes,
  fgFunctionals,
  fgChart,
  fgCode,
  fgBranding,
  mgThemes,
  mgFunctional,
  mgCard,
  bgThemes,
  strokeThemes,
} from './components/colors';

export { CDLocaleProvider } from './locales';
