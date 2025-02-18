"use client"

import Link from "next/link";
import { useState } from "react";


type Props = {
  session?: string
}
export const Header: React.FC<Props> = (props) => {
  "use client"

  const [ name, setName ] = useState("Log in!");

  if (props.session) {
    console.log("Has session")
    fetch("/api/account?session="+props.session).then( (response) => {
        console.log(response);
        response.text().then( (text) => {
            console.log(text);
            setName(text);
        });
    });
    
  } else {
    console.log("No session");
  }

  return (
    <header className="bg-gray-800 text-white p-6 flex items-center">    
      <div className="flex items-center space-x-4">
        <Link href={"/"} className="flex items-center space-x-4">
          <img
            src="/g3a.se.jpg"
            alt="Site Logo"
            className="w-12 h-12 rounded-full space-x-4"
          />
          <h1 className="text-2xl font-bold"> G3A.se </h1>
        </Link>
      </div>
      <div className="ml-auto flex items-center">
        <Link href="/user" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 hover:opacity-80 transition-opacity">
          <span className="sr-only">Open user menu</span>
          <p className="m-auto mx-4 font-bold text-lg">{name}</p>
          <img
            className="w-12 h-12 rounded-full"
            src="/pp.jpg"
            alt="user photo"
          />
        </Link>
      </div>
    </header>
  );
}
