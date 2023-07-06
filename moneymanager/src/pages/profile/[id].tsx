import { api } from "~/utils/api";
import {
  Formik,
  FormikHelpers,
  FormikProps,
  Form,
  Field,
  FieldProps,
  FormikErrors
} from 'formik';
import React from 'react'
import { GetStaticPaths, GetStaticPropsContext, InferGetServerSidePropsType, NextPage } from "next";
import { GetStaticProps } from "next";
import { ssgHelper } from "~/server/api/ssgHelper";
import Link from "next/link";
import PayeeForm from "~/components/PayeeForm";
import { useToast } from "@chakra-ui/react";


const SpendingPage: NextPage<InferGetServerSidePropsType<typeof getStaticProps>> = ({ id }) => { 
  const { isLoading, data } = api.spending.getUnique.useQuery({ userid: id })
  const toast = useToast()

  const updateSpending = api.spending.edit.useMutation({
    onSuccess: (editSpending) => { console.log(editSpending)}
  })

  const spendingTotal = data?.money ?? 0 

  if (isLoading) {
    return <div> Loading... </div>
  }

  const initialValue = {
    money: data?.money,
    category: data?.category,
    createdAt: data?.createdAt.toLocaleDateString(),
    content: data?.content
  }

  interface MyFormValues  {
    money: number | undefined,
    category: string | undefined,
    createdAt: string | undefined,
    content: string | undefined
  }

  const validateForm = (values: MyFormValues) => { 
    const errors: FormikErrors<MyFormValues> = {};

    if (!values.money) {
      errors.money = 'Amount is Required'; 
    } 

    if (!values.category) {
      errors.category = 'Please Select a Category'; 
    }

    if (!values.createdAt) {
      errors.createdAt = 'Please input a Date'; 
    }
    
    return errors;
  }

  const category = ["Food & Drinks", "Shopping", "Transporation", "Financial Expenses"]

  return (
    <div>
    <Formik initialValues={initialValue} 
      validate={validateForm}
      onSubmit={(values, actions) => {

        updateSpending.mutate({
          userid: id, 
          money: values.money,
          category: values.category,
          content: values.content,
          date: values.createdAt
        })

        toast({
          title: 'Success',
          description: 'New spending created',
          status: 'success',
          duration: 9000,
          isClosable: true,
        })
        actions.setSubmitting(false);
      }}>
        {props => 
      <Form>
        <div className="sm:px-10 py-4">
          <div className="flex flex-col bg-slate-500 rounded-lg">
            <h2 className="flex font-bold text-2xl items-center justify-center">Edit Spending</h2>
            <div className="grid grid-cols-3 px-12 mb-2 space-x-2"> 
              <label htmlFor="money" className="flex font-medium text-xl items-center">Money:</label>  
              <Field type="number" name="money"
                className="form-second col-span-2 h-8"/>
            </div>
            <div className="grid grid-cols-3 grid-flow-col px-12 mb-2 space-x-2"> 
              <label htmlFor="category" className="flex font-medium text-xl items-center">Category:</label>  
              <Field as="select" type="string" name="category"
                className="form-second block w-full col-span-2 h-8">
                  <option value={props.values.category}>{props.values.category}</option>
                  {category.filter(cat => cat !== data?.category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Field>  
            </div>
            <div className="grid grid-cols-3 px-12 mb-2 space-x-2"> 
              <div className="flex flex-row space-x-2">
                <label htmlFor="createdAt" className="flex font-medium text-xl items-center">Current Date:</label> 
                <span className="font-bold text-xl">{props.values.createdAt}</span> 
              </div>
              
              <Field type="date" name="createdAt"
                className="form-second col-span-2 h-8"/>
            </div>
            <div className="grid grid-cols-3 px-12 mb-2 space-x-2"> 
              <label htmlFor="content" className="flex font-medium text-xl items-center">Content:</label>  
              <Field type="string" name="content"
                className="form-second block col-span-2 h-8"/>
            </div>
            <div className="flex justify-center items'center pb-2 space-x-3">
                <button className="rounded bg-gray-700 px-2 pxy-2 text-white font-medium hover:bg-gray-600" type="submit">Submit</button>
              <Link href='/profile'>
                <button className="rounded bg-gray-700 px-2 pxy-2 text-white font-medium hover:bg-gray-600">Back</button>
              </Link>
            </div>
          </div>

        </div>
      </Form>  
      }
    </Formik>
    <PayeeForm spendingID={id} content={data?.content} spendingTotal={spendingTotal} date={data?.createdAt}/>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking"
  }
}

export async function getStaticProps(
  context:GetStaticPropsContext<{ id: string }>
) {
    const id = context.params?.id 

    if ( id == null ) {
      return {
        redirect: {
          destination: "/",
        }
      }
    }

    //exports the context 
    const ssg = ssgHelper(); 
    await ssg.spending.getUnique.prefetch({ userid: id })

    return {
      props: {
        trpcState: ssg.dehydrate(),
        id,
      }
    }
}



export default SpendingPage;
