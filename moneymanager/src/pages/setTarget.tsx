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
import { useSession } from "next-auth/react";
import { useToast } from "@chakra-ui/react";


// const setTarget: NextPage<InferGetServerSidePropsType<typeof getStaticProps>> = ({ id }) => { 
export default function Page(){

  const session = useSession()
  const user = session.data?.user.id as string
  const { isLoading, data } = api.user.getTarget.useQuery({user})
  const toast = useToast()

  const editTarget = api.user.editTarget.useMutation({
    onSuccess: (editTarget) => { console.log(editTarget)}
  })


  if (isLoading) {
    return <div> Loading... </div>
  }

  const initialValue = {
    target: data?.target,
  }

  interface MyFormValues  {
    target: number | undefined,
  }

  const validateForm = (values: MyFormValues) => { 
    const errors: FormikErrors<MyFormValues> = {};

    if (!values.target) {
      errors.target = 'Enter a target'; 
    } 

    return errors;
  }


  return (
    <div>
    <Formik initialValues={initialValue} 
      validate={validateForm}
      onSubmit={(values, actions) => {

        editTarget.mutate({
          userid: id, 
          target: values.target
        })

        toast({
          title: 'Success',
          description: 'New target created',
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
            <h2 className="flex font-bold text-2xl items-center justify-center">Edit Target</h2>
            <div className="grid grid-cols-3 px-12 mb-2 space-x-2"> 
              <label htmlFor="money" className="flex font-medium text-xl items-center">New Target:</label>  
              <Field type="number" name="target"
                className="form-second col-span-2 h-8"/>
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



// export default setTarget;
