import React from "react";

const Menu = React.forwardRef(({ children, ...props }, ref) => (
  <div style={{display:"flex",justify:"flex-start",alignItems:"center"}}>
    {children}    
  </div>
));

const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu {...props} ref={ref} />
));

export default Toolbar