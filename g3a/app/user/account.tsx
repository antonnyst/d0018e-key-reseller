"use client"
import Form from "next/form";
import { logout } from "../cookies";
import React from "react";

type Props = {
    className?: string
}

type SessionProps = {
    session: string
}

const LogoutButton: React.FC<Props> = (props) => {
    return (
        <button className={props.className} onClick={()=>{
            logout();
            document.location.href="/"
        }}>
            Log out!        
        </button>
    );
}

const ChangePasswordPage: React.FC<SessionProps> = (props) => {
    const [status, setStatus] = React.useState("");
        
    async function action(formData: FormData) {
        const oldPassword = formData.get("oldPassword");
        const newPassword = formData.get("newPassword");
        
        const result = await fetch("/api/account", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                "session": props.session, 
                "oldPassword": oldPassword,
                "newPassword": newPassword
            })
        });

        if (result.ok) {
            setStatus("Password changed!");
        } else {
            setStatus("Failed to change password!");
        }
    }
    return (
        <Form action={action}>
            <div className="bg-gray-50 p-6 rounded-lg  mx-auto flex flex-col items-center gap-2 m-2">
                <div className="w-full">
                    <h1 className="text-red-600 text-center">{status}</h1>
                </div>
                <div className="w-full">
                    <h1 className="text-center">Old Password</h1>
                    <input name="oldPassword" type="password" className="border-black border w-full"></input>
                </div>
                <div className="w-full">
                    <h1 className="text-center">New Password</h1>
                    <input name="newPassword" type="password" className="border-black border w-full"></input>
                </div>
                <div className="w-full">
                    <button type="submit" className="border-black border ml-[25%] mr-[25%] w-[50%]">Change password</button>
                </div>
            </div>
        </Form>
    );
}

export const AccountPage: React.FC<SessionProps> = (props) => {
    return (
        <div className='max-w-2xl mt-6 mx-auto bg-white p-6 rounded-lg shadow-md py-6 pb-6 my-6'>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Account</h1>
            <ChangePasswordPage session={props.session}></ChangePasswordPage>
            <LogoutButton className='p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700'></LogoutButton>
        </div>
    );
}
