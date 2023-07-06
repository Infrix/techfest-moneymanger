import { SpendingProps } from "~/pages/profile"
import { api } from "~/utils/api"
import ProfileImg from "./ProfileImg"
import Payee from "./Payee"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);


export type Payment = {
  amount: number,
  resolved: boolean,
  userId: string,
  payeeId: string, 
}

export default function Expense({spendings, userId}: SpendingProps) {
  const payments = api.payment.getPayments.useQuery(userId) 

  const currMonth = new Date().getMonth() //not sure if this refreshes when 
  const currYear = new Date().getFullYear()

  const dataMonthly = spendings?.filter(post => (post.createdAt.getMonth() == currMonth && post.createdAt.getFullYear() == currYear))
  const totalMonthly = dataMonthly?.reduce((sum: number, post) => sum + post.money, 0) ?? 0

  const foodExp = dataMonthly?.filter(post => post.category == 'Food & Drinks').reduce((sum: number, post) => sum + post.money, 0) ?? 0
  const shopExp = dataMonthly?.filter(post => post.category == 'Shopping').reduce((sum: number, post) => sum + post.money, 0) ?? 0
  const transExp = dataMonthly?.filter(post => post.category == 'Transporation').reduce((sum: number, post) => sum + post.money, 0) ?? 0 
  const finExp = dataMonthly?.filter(post => post.category == 'Financial Expenses').reduce((sum: number, post) => sum + post.money, 0) ?? 0
  

  // find out how to query payments by same month instead of filter after querying all 
  const collect = payments.data?.collect.filter(post => post.validated && post.date.getFullYear() == currYear && post.date.getMonth() == currMonth).reduce((sum: number, post) => sum + post.amount, 0) ?? 0
  const paid = payments.data?.owe.filter(post => post.validated && post.date.getFullYear() == currYear && post.date.getMonth() == currMonth).reduce((sum: number, post) => sum + post.amount, 0) ?? 0

  const total = totalMonthly - collect + paid

  const data = {
    labels: ['Food & Drinks', 'Shopping', 'Transporation', 'Financial Expenses'],
    datasets: [
      {
        label: 'Amount Spent',
        data: [foodExp, shopExp, transExp, finExp],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
        color: 'rbg(0,0,0)',
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: 'black', // Change the font color
          font: {
            size: 12, // Change the font size
          },
        },
      },
    },
  };

  return(
    <div className="bg-slate-500 px-4 py-2 rounded-lg">
          <p className="border-solid border-slate-600 border-b-2 font-bold">Expenses Monthly:</p>
          <div className="flex justify-between pb-2">
            <div> 
              <span className="font-semibold text-2xl">Total: </span>
              <span className="text-xl">${total}</span>
            </div>
            <div className='flex items-center'>
              <span>{currMonth + 1}/{currYear}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 justify-center">
            <div>
              <h2 className="text-xl font-semibold">Categorical Expenses:</h2>
              <div className="grid grid-cols-2">
                  <p>Food & Drinks:</p>
                  <p>${foodExp}</p>
                  <p>Shopping:</p>
                  <p>${shopExp}</p>
                  <p>Transportation:</p>
                  <p>${transExp}</p>
                  <p>Financial:</p>
                  <p>${finExp}</p>
               </div>   
              <h2 className="text-xl font-semibold">Payment Friends:</h2>
              <div className="grid grid-cols-2">
                <p>Collected: </p>
                <p>${collect}</p>
              </div>
              <p className="font-light text-sm">{`(excluded from total)`}</p>
              <div className="grid grid-cols-2">
                <p>Paid: </p>
                <p>${paid}</p>
              </div>
              <p className="font-light text-sm">{`(included in total)`}</p>
            </div>
            <div style={{ height: '300px' }}>
              <Doughnut options={options} data={data} redraw={true}/>
            </div>
          </div>
          
    </div>
  )
}