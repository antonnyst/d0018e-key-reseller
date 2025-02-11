"use client"
import Form from 'next/form'
import { login } from '../cookies';


export default function LoginPage() {
    
    function action() {
        login();
        document.location.href="/user"
    }
    
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <Form action={action}>
                <div className="bg-white p-6 rounded-lg shadow-md mx-auto w-[90%] md:w-[50%] lg:w-[20%] flex flex-col items-center gap-2 m-2 border">
                    <div className="w-full">
                        <h1 className="text-center">Username</h1>
                        <input name="username" className="border-black border w-full"></input>
                    </div>
                    <div className="w-full">
                        <h1 className="text-center">Password</h1>
                        <input name="password" type="password" className="border-black border w-full"></input>
                    </div>
                    <div className="w-full">
                        <button type="submit" className="border-black border ml-[25%] mr-[25%] w-[50%]">Log in!</button>
                    </div>
                </div>
            </Form>
        </div>
    );
  }