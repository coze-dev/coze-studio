import { useValidateOrderFields } from './use-validate-order-by-fields';
import { OrderBySection } from './order-by-section';
import { OrderByList } from './order-by-list';

export function OrderBy() {
  useValidateOrderFields();

  return (
    <OrderBySection>
      <OrderByList />
    </OrderBySection>
  );
}
