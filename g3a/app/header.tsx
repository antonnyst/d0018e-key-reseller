"use client"

import React from "react";
import { logout } from "./cookies";


type IProps = {
  session?: string
}

interface IState {
  name?: string 
}

export class Header extends React.Component<IProps, IState> {
  componentDidMount(): void {
    if (this.props.session) {
      fetch("/api/account?session="+this.props.session)
        .then(response => { 
          if (!response.ok) {
            logout();
            return "Log in!";
          }
          return response.text()
        })
        .then(json => { this.setState({name: json}) })
        .catch(err => { console.log(err) });
    }
    
  }
  render(): React.ReactNode {      
    let name = "Log in!";
    if (this.state?.name) {
      name = this.state.name;
    }

    return (
      <header className="bg-gray-800 text-white p-6 flex items-center">    
        <div className="flex items-center space-x-4">
          <a href={"/"} className="flex items-center space-x-4">
            <img
              src="/g3a.se.jpg"
              alt="Site Logo"
              className="w-12 h-12 rounded-full space-x-4"
            />
            <h1 className="text-2xl font-bold"> G3A.se </h1>
          </a>
        </div>
        <div className="ml-auto flex items-center">
          <a href="/user" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 hover:opacity-80 transition-opacity">
            <span className="sr-only">Open user menu</span>
            <p className="m-auto mx-4 font-bold text-lg">{name}</p>
            <img
              className="w-12 h-12 rounded-full"
              src="/pp.jpg"
              alt="user photo"
            />
          </a>
        </div>
      </header>
    );
  }
}