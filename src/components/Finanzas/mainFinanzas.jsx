import React, {useState} from 'react';
import Tabs from '../scripts/tabs/Tabs';
import FinanceSummary from './financeSummary';
import PendingPayments from './paymentPending';
import PeriodCards from './PeriodControlReport';

const handleToggle = (index) => {
    setActiveIndex(index);
  };

const Finanzas = () => {
const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div>
        <div>
            <Tabs
                tabLabels={['Resumen', 'Pendientes', 'Informes']}
                tabContents={[
                  <FinanceSummary/>,
                  <PendingPayments/>,
                  <PeriodCards/>
                ]}
                activeIndex={activeIndex} 
                onToggle={handleToggle} 

            />
        </div>

    </div>
  );
};

export default Finanzas;
