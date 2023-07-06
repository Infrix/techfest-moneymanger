import ProfileImg from "./ProfileImg";
import Link from "next/link";
import { TargetProps } from "~/pages/profile";
import { api } from "~/utils/api";
import Payee from "./Payee";

export default function Target({src, name, spendings, userId}: TargetProps) {
  const { isLoading, data } = api.payment.getPayments.useQuery(userId)
  const { targetData } = api.user.getTarget.useQuery(userId)
  const utils = api.useContext()
  const resolvePayment = api.payment.resolve.useMutation({
    onSuccess: (editSpending) => { 
      utils.payment.invalidate() // find out how to invalidate 
    }
  })

  const validatePayment = api.payment.validate.useMutation({
    onSuccess: (editSpending) => { 
      utils.payment.invalidate() // find out how to invalidate 
    }
  })

  const handleResolve = (id: string) => {
    resolvePayment.mutate(id)
  }

  const handleValidate = (id: string) => {
    validatePayment.mutate(id)
  }

  return ( 
    <div className="bg-slate-500 px-4 py-2 rounded-lg">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between border-b-2 pb-1 border-slate-600"> 
          <ProfileImg src={src} name={name}/>
          <Link href="/search" className="text-white px-2 bg-gray-900 rounded hover:bg-slate-600 pt-2"> 
            Contacts
          </Link> 
        </div>

        <div className="flex flex-row justify-between border-b-2 border-slate-600 py-2"> 
          <div className="flex flex-row space-x-2">
            <p className="text-xl font-bold">Target this month:</p>
            <p>{targetData ? "$" + targetData : "No Target Set"}</p>
          </div>
          <div className="flex justify-end">
            {/* <button className="text-white px-2 bg-gray-900 rounded hover:bg-slate-600">Set Target</button> */}
            <Link href='/setTarget' className="text-white px-2 bg-gray-900 rounded hover:bg-slate-600 pt-2"> 
            Set Target
          </Link> 
          </div>
        </div>
        
        <div>
          <h2 className="font-bold">Unresolved Payments</h2>
              {
                data?.owe.filter(post => !post.resolved)
                .map((post, ind) => 
                    <ul key={ind} className="lg:grid lg:grid-cols-4">
                    <div className="flex flex-cols space-x-2 pr-2">
                      <p>{ind + 1}.</p>
                      <Payee userId={post.userId}/>
                      <div>${post.amount}</div>
                      
                    </div>
                    <div className="col-span-2 pr-2">{post.note}</div>
                    <div className="lg:flex lg:justify-center">
                      <button className="hover:text-red-400" onClick={() => handleResolve(post.id)}>Resolve</button>
                    </div>
                  </ul>
                )
              }
        </div>
          <div> 
            <h2 className="font-bold">Payment to collect</h2>
            <div className="rounded-md bg-slate-500 space-y-1">
              {
                data?.collect.filter(post => !post.validated).map((post, ind) => 
                  <ul key={ind} className="lg:grid lg:grid-cols-4">
                    <div className="flex flex-cols space-x-2 pr-1">
                      <p>{ind + 1}.</p>
                      <Payee userId={post.userId}/>
                      <div>${post.amount}</div>
                      
                    </div>
                    <div className="col-span-2 pr-2">{post.note}</div>
                    <div className="lg:flex lg:justify-center">
                      {
                        post.resolved ? <button className="hover:text-red-400" onClick={() => handleValidate(post.id)}>Validate</button>
                                      : <p>Pending...</p>
                      }
                    </div>
                  </ul>
                )
              }
            </div>
              
          </div>
      </div>
    </div>
  )
}