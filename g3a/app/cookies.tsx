"use client"
import { deleteCookie, setCookie } from 'cookies-next' 

export async function login(formData: FormData) {
    const name = formData.get("name");
    const password = formData.get("password");
    
    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name, password: password })
    });

    if (response.ok == false) {
        return false;
    }

    const sessionToken = await response.text();
   
    setCookie("g3a-session", sessionToken);
    return true;
}

export async function register(formData: FormData) {
    const name = formData.get("name");
    const password = formData.get("password");

    const response = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name, password: password })
    });

    if (response.ok == false) {
        return false;
    }

    const sessionToken = await response.text();
    
    setCookie("g3a-session", sessionToken);
    return true;
}

export function logout() {
    deleteCookie("g3a-session");
}


type Props = {
    className?: string
}

export const LogoutButton: React.FC<Props> = (props) => {
    return (
        <button className={props.className} onClick={()=>{
            logout();
            document.location.href="/"
        }}>
            Log out!
        </button>
    );
}

