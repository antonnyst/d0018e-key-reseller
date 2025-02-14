"use client";
import Form from 'next/form';
import { register } from '../cookies';
import React from 'react';

export default function SignupPage() {
    const [status, setStatus] = React.useState("");

    async function action(formData: FormData) {
        const result = await register(formData);
        if (result) {
            document.location.href = "/user";
        } else {
            setStatus("Failed to sign up! Please try again.");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <Form action={action}>
                <div className="bg-white p-6 rounded-lg shadow-md mx-auto w-[90%] md:w-[50%] lg:w-[20%] flex flex-col items-center gap-2 m-2 border">
                    <div className="w-full">
                        <h1 className="text-red-600 text-center">{status}</h1>
                    </div>
                    <div className="w-full">
                        <h1 className="text-center">Username</h1>
                        <input name="name" className="border-black border w-full" />
                    </div>
                    <div className="w-full">
                        <h1 className="text-center">Password</h1>
                        <input name="password" type="password" className="border-black border w-full" />
                    </div>
                    <div className="w-full">
                        <button type="submit" className="border-black border ml-[25%] mr-[25%] w-[50%]">Sign up!</button>
                    </div>
                </div>
            </Form>
        </div>
    );
}