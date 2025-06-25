"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { createContext, use, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutsideClick } from "../hooks/useOutsideClick";

//translate-x-3.5
function StyledToggle({ onClick, children, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`hover:bg-primary-200 flex items-center justify-center gap-2 rounded-lg bg-none p-0.5 text-neutral-700 transition-all duration-200 [&_svg]:h-6 [&_svg]:stroke-1 hover:[&_svg]:stroke-2 ${isActive ? "bg-primary-200" : ""}`}>
      {children}
    </button>
  );
}

function StyledList({ position, children, ref }) {
  return (
    <ul
      ref={ref}
      className={`bg-primary-50 border-primary-200 fixed min-w-max rounded-lg border p-1 shadow-md`}
      style={{
        // using style because tailwind does not allow class names interpolation from props
        top: `${position?.y || 20}px`,
        right: `${position?.x || 20}px`,
      }}>
      {children}
    </ul>
  );
}

function StyledButton({ children, onClick }) {
  return (
    <button
      className="hover:bg-primary-200 active:bg-primary-200 flex min-w-32 items-center gap-2.5 rounded-lg border-none bg-none px-2 py-1.5 text-left text-sm transition-all duration-200 [&_svg]:size-3.5 [&_svg]:stroke-1 hover:[&_svg]:stroke-[1.6]"
      onClick={onClick}>
      {children}
    </button>
  );
}

//1- i-Create Context
const MenusContext = createContext();

//2- Create the parent component
function Menus({ children }) {
  const [openId, setOpenId] = useState("");
  const [position, setPosition] = useState(null);

  const close = () => setOpenId("");
  const open = setOpenId;

  //later
  //close window when pressing escape button
  //Close menu when user scrolls:
  useEffect(() => {
    if (!openId) return;
    const handleScroll = () => close();

    window.addEventListener("scroll", handleScroll, true);
    return window.removeEventListener("scroll", handleScroll, true);
  }, [openId]);

  // ii- provide context
  return (
    <MenusContext.Provider
      value={{ openId, close, open, position, setPosition }}>
      {children}
    </MenusContext.Provider>
  );
}

//3- Create the children components

function Menu({ children }) {
  return <div className="flex items-center justify-end">{children}</div>;
}

function MenuToggle({ id }) {
  //iii- consume context
  const { openId, open, close, position, setPosition } = use(MenusContext);

  function handleClick(e) {
    //to get the coordinates of the exact toggle for the specific row
    const rect = e.target.closest("button").getBoundingClientRect();
    // console.log(rect);
    // setPosition({ x: rect.x, y: rect.y });
    setPosition({
      x: window.innerWidth - rect.width - rect.x,
      y: rect.y + rect.height + 2,
    });

    if (openId === "" || openId !== id) {
      open(id);
    } else {
      close();
    }
  }

  return (
    <StyledToggle onClick={handleClick} isActive={openId === id}>
      <EllipsisVerticalIcon />
    </StyledToggle>
  );
}

function MenuList({ id, children }) {
  const { openId, position, close } = use(MenusContext);

  const ref = useOutsideClick(close);
  if (id !== openId) return null;

  return createPortal(
    <StyledList ref={ref} position={position}>
      {children}
    </StyledList>,
    document.body,
  );
}

function MenuButton({ children, onClick }) {
  const { close } = use(MenusContext);

  function handleClick() {
    onClick?.();
    close();
  }

  return (
    <li>
      <StyledButton onClick={handleClick}>{children}</StyledButton>
    </li>
  );
}

//4- Link parent to children
Menus.Menu = Menu;
Menus.MenuToggle = MenuToggle;
Menus.MenuList = MenuList;
Menus.MenuButton = MenuButton;

export default Menus;
