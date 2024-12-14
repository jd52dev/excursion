"use client";

import React, { useEffect, useRef, useState } from "react";
import { logOut } from "../(services)/auth";
import {
  getUser,
  updateAbout,
  updateProfilePic,
  updateUsername,
} from "../(services)/firestore";
import { useAuthContext } from "../(services)/authProvider";
import { redirect } from "next/navigation";
import Image from "next/image";
import { DocumentData } from "firebase/firestore";
import { PiSignOutBold } from "react-icons/pi";

export default function Account() {
  const { user } = useAuthContext();
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const originalUserDataRef = useRef<DocumentData>(undefined);
  const usernameBtnRef = useRef<HTMLButtonElement>(null);
  const aboutBtnRef = useRef<HTMLButtonElement>(null);
  const fileBtnRef = useRef<HTMLInputElement>(null);
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    if (!user) {
      redirect("/signin");
    }
    getUser(user.uid)
      .then((userData) => {
        originalUserDataRef.current = userData;
        setUsername(userData?.username);
        setAbout(userData?.about);
        setProfilePic(userData?.image);
      })
      .catch((e) => console.log(e));
  }, [user]);

  return (
    <section className="flex flex-col w-full min-h-screen items-center md:px-[10%] lg:px-[20%]">
      <div className="p-4 flex flex-col w-full">
        <input
          type="file"
          name="image"
          id="image"
          className="hidden"
          ref={fileBtnRef}
          accept="image/*"
          onChange={() => {
            if (fileBtnRef.current && fileBtnRef.current?.files) {
              updateProfilePic(user?.uid, fileBtnRef.current.files[0]).then(
                () => {
                  setProfilePic(
                    URL.createObjectURL(fileBtnRef.current!.files![0])
                  );
                }
              );
            }
          }}
        />
        <button
          className="w-fit h-fit bg-gray-200 rounded-full mx-auto"
          onClick={() => fileBtnRef.current?.click()}
        >
          <Image
            className="rounded-full aspect-square w-48 object-cover pointer-events-none"
            src={profilePic || "/images/profile.jpg"}
            width={640}
            height={640}
            alt="Picture of the author"
          />
        </button>
        <span className="py-2 flex flex-col">
          <label className="" htmlFor="name">
            Name:
          </label>
          <span className="flex flex-row">
            <span className="flex w-full flex-col justify-end">
              <input
                className="border-2 border-black rounded-md p-2 w-full"
                type="text"
                id="name"
                name="name"
                maxLength={27}
                value={username}
                onChange={(e) => {
                  if (usernameError) {
                    setUsernameError("");
                  }
                  setUsername(e.target.value);
                  if (e.target.value == originalUserDataRef.current?.username) {
                    usernameBtnRef.current!.style.display = "none";
                  } else {
                    usernameBtnRef.current!.style.display = "block";
                  }
                }}
                placeholder="Steve"
              />
              <span className="flex flex-row justify-between">
                <p className="text-red-600 pl-2">{usernameError}</p>
                <p className="pr-2">{username.length}/27</p>
              </span>
            </span>

            <button
              ref={usernameBtnRef}
              className="border-2 border-accent p-button rounded-md bg-accent ml-2 h-fit hidden"
              onClick={() => {
                updateUsername(user?.uid, username)
                  .then(() => {
                    const newUsername = username.trim();
                    originalUserDataRef.current!.username = newUsername;
                    setUsername(newUsername);
                    usernameBtnRef.current!.style.display = "none";
                  })
                  .catch((error) => {
                    setUsernameError(error.message);
                  });
              }}
            >
              Update
            </button>
          </span>
        </span>
        <span className="py-2 flex flex-col">
          <label className="" htmlFor="about">
            About:
          </label>
          <textarea
            className="border-2 border-black rounded-md py-1 px-2"
            rows={4}
            id="about"
            name="about"
            value={about}
            onChange={(e) => {
              setAbout(e.target.value);
              if (e.target.value == originalUserDataRef.current?.about) {
                aboutBtnRef.current!.style.display = "none";
              } else {
                aboutBtnRef.current!.style.display = "block";
              }
            }}
            placeholder="About me"
          />
          <button
            ref={aboutBtnRef}
            onClick={() => {
              console.log("about button clicked");

              updateAbout(user?.uid, about)
                .then(() => {
                  const newAbout = about.trim();
                  originalUserDataRef.current!.about = newAbout;
                  setAbout(newAbout);
                  aboutBtnRef.current!.style.display = "none";
                })
                .catch((error) => {
                  console.log(error);
                });
            }}
            className="border-2 border-accent p-button rounded-md bg-accent w-fit mt-2 hidden"
          >
            Update
          </button>
        </span>
        <hr className="border-black my-4" />
        <button
          className="p-button rounded-md bg-gray-200 flex flex-row justify-center items-center"
          onClick={() => logOut()}
        >
          <PiSignOutBold className="mr-4 size-5" />
          <p>Sign Out</p>
        </button>
      </div>
    </section>
  );
}
