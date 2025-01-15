import React, {useState} from 'react';
import Tabs from '../scripts/tabs/Tabs';
import FinanceSummary from './financeSummary';
import PendingPayments from './paymentPending';
import PeriodCards from './PeriodControlReport';
import GymSalaryManager from '../scripts/Gym/GymSalaryManager';

const handleToggle = (index) => {
    setActiveIndex(index);
  };

const Finanzas = () => {
const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div>
        <div >
            <Tabs
                tabLabels={['Resumen','Sueldos', 'Pagos Pendientes', 'Informes']}
                tabContents={[
                  <FinanceSummary/>,
                  <GymSalaryManager/>,
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
