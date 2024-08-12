import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import packageJson from "../../../../package.json";
import { useProjectName } from "@/hooks/useFirebase";
import { useRouter } from "next/router";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
const pages = [
  {
    label: "Home",
    route: "/",
    icon : HomeIcon
  },
  {
    label: "Upload",
    route: "/upload",
    icon: CloudUploadIcon
  },
  {
    label: "Update",
    route: "/home",
    icon: EditIcon
  },
];
const TemporaryDrawer: React.FC<{
  open: boolean;
  setOpen: (arg: boolean) => void;
}> = ({ open, setOpen }) => {
  const { projectName, loading } = useProjectName();
  const router = useRouter();
  const version = React.useMemo(() => packageJson.version, []);
  const isCredsAvaialble = React.useMemo(() => !!projectName, [projectName]);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };


  const onLogout=React.useCallback(()=>{
    localStorage.clear();
    window.location.reload();
  },[]);

  const DrawerList = (
    <Box sx={{ width: 250 ,height:'100vh'}} role="presentation" onClick={toggleDrawer(false)} className="bg-dark text-white">
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push("/")}>
            <ListItemIcon>
              <SupervisorAccountIcon className="text-white"/>
            </ListItemIcon>
            <ListItemText primary={projectName} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider className="text-white"/>
      <List>
        {pages.map((page, index) => (
          <ListItem key={page.label} disablePadding>
            <ListItemButton onClick={() => router.push(page.route)}>
              <ListItemIcon>
                {/* {index % 2 === 0 ? <InboxIcon /> : <MailIcon />} */}
                {page.icon  && <page.icon className="text-white"/>}
              </ListItemIcon>
              <ListItemText primary={page?.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={onLogout}>
            <ListItemIcon>
              <LogoutIcon className="text-white"/>
            </ListItemIcon>
            <ListItemText primary={"Log out"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
        <Box className="bg-dark">
          <p className="text-white text-center ">version: {version}</p>
        </Box>
      </Drawer>
    </>
  );
};

export default TemporaryDrawer;
