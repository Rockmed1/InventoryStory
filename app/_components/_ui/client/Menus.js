"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { createContext, use, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutsideClick } from "../../../_hooks/useOutsideClick";

//translate-x-3.5
function StyledToggle({ onClick, children, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg bg-none p-0.5 text-neutral-700 transition-all duration-200 hover:bg-neutral-100 [&_svg]:h-6 [&_svg]:stroke-1 hover:[&_svg]:stroke-2 ${isActive ? "bg-neutral-100" : ""}`}>
      {children}
    </button>
  );
}

function StyledList({ position, children, ref }) {
  return (
    <ul
      ref={ref}
      className={`fixed min-w-max rounded-lg border border-neutral-200 bg-white p-1 shadow-md`}
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
      className="flex min-w-32 items-center gap-2.5 rounded-lg border-none bg-none px-2 py-1.5 text-left text-sm transition-all duration-200 hover:bg-neutral-100 active:bg-neutral-100 [&_svg]:size-3.5 [&_svg]:stroke-1 hover:[&_svg]:stroke-[1.6]"
      onClick={onClick}>
      {children}
    </button>
  );
}

//1- i-Create Context
const MenusContext = createContext();

//2- Create the parent component

/**
 * A compound component for creating dropdown menus with encapsulated state.
 * @param {React.ReactNode} children - The child components, typically `Menus.Menu`.
 */
function Menus({ children }) {
  const [openId, setOpenId] = useState("");
  const [position, setPosition] = useState(null);

  const close = () => setOpenId("");
  const open = setOpenId;

  //LATER: //close window when pressing escape button

  //Close menu when user scrolls:
  useEffect(() => {
    if (!openId) return;
    const handleScroll = () => close();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [openId]);

  return (
    <MenusContext.Provider
      value={{ openId, close, open, position, setPosition }}>
      {children}
    </MenusContext.Provider>
  );
}

//3- Create the children components

/**
 * A container for a single menu instance.
 * @param {React.ReactNode} children - Typically `Menus.MenuToggle` and `Menus.MenuList`.
 */
function Menu({ children }) {
  return <div className="flex items-center justify-end">{children}</div>;
}

/**
 * The button that toggles the menu's visibility.
 * @param {string | number} id - A unique ID for this menu instance.
 */
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
    if (openId === "" || openId !== id) open(id);
    else close();
  }

  return (
    <StyledToggle onClick={handleClick} isActive={openId === id}>
      <EllipsisVerticalIcon />
    </StyledToggle>
  );
}

/**
 * The list of menu items. Renders into a portal.
 * @param {string | number} id - The ID of the menu instance this list belongs to.
 * @param {React.ReactNode} children - The `Menus.MenuButton` components.
 */
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

/**
 * A single button/item within a menu list.
 * @param {React.ReactNode} children - The content of the button (icon and text).
 * @param {Function} [onClick] - A function to call when the button is clicked.
 */
function MenuButton({ children, onClick, ...props }) {
  const { close } = use(MenusContext);

  function handleClick() {
    onClick?.();
    close();
  }

  return (
    <li>
      <StyledButton onClick={handleClick} {...props}>
        {children}
      </StyledButton>
    </li>
  );
}

//4- Link parent to children
Menus.Menu = Menu;
Menus.MenuToggle = MenuToggle;
Menus.MenuList = MenuList;
Menus.MenuButton = MenuButton;

export default Menus;
