import React, { useEffect, useState } from "react";
import {
  Formik,
  Form,
  Field,
  FormikErrors,
  ErrorMessage,
} from 'formik';
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Email from "next-auth/providers/email";
import Payee from "./Payee";
import { TiTickOutline } from "react-icons/ti"
import { BiErrorCircle } from "react-icons/bi"

type PayeeFormProps = {
  spendingID: string,
  spendingTotal: number 
  content?: string,
  date?: Date,
}

type AddPayeeProps = { 
  spendingID: string,
  spendingTotal: number 
  content?: string,
  totalAssigned: number,
  date?: Date,
}

function NewForm({spendingID, spendingTotal, content, totalAssigned, date}: AddPayeeProps) {
  const session = useSession()
  const userId = session.data?.user.id as string
  const userName = session.data?.user.name as string
  const utils = api.useContext()

  const following = api.user.getFollowing.useQuery(userId).data
  const followers = api.user.getFollowers.useQuery(userId).data
  
  const createPayment = api.payment.create.useMutation({
    onSuccess: (input) => {
      utils.payment.invalidate()
      }
  })

  interface MyFormValues {
    amount: number,
    userId: string,
    payeeId: string, 
    spendingId: string,
    note: string,
    date: string
  }

  const initialValues: MyFormValues = {
    amount: 0,
    userId: userId,
    payeeId: '',
    spendingId: spendingID, 
    note: content == undefined || null ? "" : content,
    date: date == undefined ? "" : date.toString()
  };

  const validateForm = (values: MyFormValues) => {
    const errors: FormikErrors<MyFormValues> = {};

    if (values.payeeId == "") {
      errors.payeeId = 'Must include Friend'
    }

    if (!values.amount) {
      errors.amount = "Must include Amount"
    } 
    
    if (values.amount + totalAssigned > spendingTotal) {
      errors.amount = 'Cannot assign payment greater than spending'
    }

    return errors
  }

  return (
    <div>
       <Formik
         initialValues={initialValues}
         validate={validateForm}
         onSubmit={(values, actions) => {
            createPayment.mutate({
              userId: values.userId,
              payeeId: values.payeeId,
              amount: values.amount,
              spendingID: values.spendingId,
              note: values.note,  
              date: values.date
            })            
            actions.setSubmitting(false)
            actions.resetForm()
         }}
       >
         <Form>
          <div className="md:flex md:flex-row justify-center items-center px-5">
            <div className="md:flex md:flex-row md:space-x-3 md:space-y-0 space-y-2">
              <div className="space-x-2">
                <label htmlFor="payeeId">Add Payee:</label>
                <Field as="select" id="payeeId" name="payeeId" type="string" className="form-primary">
                <option value="" disabled>Select Friend</option>
                  {followers?.map((post, index) => (
                      <option key={index} value={`${post.followingId}`}>{post.followingName}</option>
                    ))}
                  {following?.map((post, index) => (
                      <option key={index} value={`${post.followerId}`}>{post.followerName}</option>
                    ))}
                </Field>
              </div>
              <div className="space-x-2">
                <label htmlFor="amount">Add Amount:</label>
                <Field type="number" id="amount"  name="amount" placeholder="Enter Amount" className="form-primary"/>
              </div>
              <div className="space-x-2">
                <label htmlFor="note">Payment Note:</label>
                <Field type="string" id="note" name="note" placeholder="Add note" className="form-primary"/>    
              </div>
            </div>
            <div className="md:pt-0 pt-2 pl-8">
              <button type="submit" className="btn-primary px-10">Add Payee</button>
            </div>


          </div>
          <div className="flex justify-center"> 
            <ErrorMessage name="payeeId">{msg => 
              <div className="flex flex-cols space-x-1 items-center">
                <BiErrorCircle className="h-5 w-5 text-amber-500"/>
                <p className="font-bold text-slate-700">{msg}</p>
              </div>
              }</ErrorMessage>
          </div>
          <div className="flex justify-center"> 
            <ErrorMessage name="amount">{msg => 
              <div className="flex flex-cols space-x-1 items-center">
                <BiErrorCircle className="h-5 w-5 text-amber-500"/>
                <p className="font-bold text-slate-700">{msg}</p>
              </div>
              }</ErrorMessage>
          </div>

         </Form>
       </Formik>
     </div>

  )
}


export default function PayeeForm({spendingID, content, spendingTotal, date}: PayeeFormProps) {
  const [close, setClose] = useState(false)
  const session = useSession()
  const userId = session.data?.user.id as string
  const utils = api.useContext()

  const { isLoading, data } = api.payment.getPayee.useQuery(spendingID)
  const validatePayment = api.payment.validate.useMutation({
    onSuccess: (editSpending) => { 
      utils.payment.invalidate() // find out how to invalidate 
    }
  })
  
  const handleValidate = (id: string) => {
    validatePayment.mutate(id)
  }

  const totalAssigned = data?.reduce((acc, post) => post.amount + acc, 0) ?? 0

  return (
    <div className="sm:px-10 py-4">
      <div className="bg-slate-500 rounded-lg pb-2">
        <div className="border-b-slate-600 border-b-2 mx-10 mb-2">
          <h2 className="flex font-bold text-2xl items-center justify-center">Payee Records</h2>
        </div>
        <div className="pb-2">
        {
              data == undefined || data?.length == 0 ? <></> :
              <div className="border-b-slate-600 border-b-2 mx-10">
                  <div className="mb-2">
                  {
                  data?.map((post, ind) => 
                    <div key={ind} className="md:grid md:grid-cols-5 px-5 md:pb-0 pb-4">
                      <div className="flex flex-cols space-x-1">
                        <p className="font-bold">Payee Name:</p> 
                        <Payee userId={post.payeeId}/>
                      </div>
                      <div className="flex flex-cols space-x-1 md:px-4">
                        <p className="font-bold">Amount:</p>
                        <p key={ind}>${post.amount}</p>
                      </div>
                      <div className="flex flex-cols space-x-1 md:px-4">
                        <p className="font-bold">Note:</p>
                        <p key={ind}>{post.note}</p>
                      </div>
                      <div className="flex flex-cols space-x-1 md:pl-5"> 
                        <p className="font-bold">Status:</p>
                        { post.validated ? <p>Validated</p> : post.resolved ? <p>Resolved</p> : <p>Pending Payment</p>}
                      </div>
                      <div className="flex flex-cols space-x-1 md:pl-5"> 
                        { post.validated ? <TiTickOutline className="h-7 w-7 text-slate-800"/>
                        : <button className="hover:text-white font-bold" onClick={() => handleValidate(post.id)}>Confirm Paid</button>}
                      </div>
                    </div>
                  )
                  }
                  </div> 
                </div>
            }
        </div> 
          {close ? <NewForm spendingID={spendingID} spendingTotal={spendingTotal} content={content} totalAssigned={totalAssigned} date={date}/> : <></>}
          <div className="flex justify-center space-x-2 pt-1">
            {
              close ? 
              <button className="btn-primary px-10" onClick={() => setClose(!close)}>
                Close
              </button> :
              <button className="btn-primary px-10" onClick={() => setClose(!close)}>
                Add New Payee
              </button> 
            }
          </div>  
      </div>
    </div>
  )

}