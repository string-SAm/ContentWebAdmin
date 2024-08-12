import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import AdbIcon from "@mui/icons-material/Adb";
import { useProjectName } from "@/hooks/useFirebase";
import { useRouter } from "next/router";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import packageJson from "../../package.json";
import TemporaryDrawer from "./common/sidebar";
const pages = [
  {
    label: "Home",
    route: "/",
  },
  {
    label: "Upload",
    route: "/upload",
  },
  {
    label: "Edit Translation",
    route: "/home",
  },
];
function Navbar() {
  const { projectName, loading } = useProjectName();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
    localStorage.clear();
    window.location.reload();
  };
  const version = React.useMemo(() => packageJson.version, []);
  const isCredsAvaialble = React.useMemo(() => !!projectName, [projectName]);
  return (
    <AppBar position="static" className="bg-dark">
      <div className="px-2">
        <Toolbar disableGutters>
          <IconButton aria-label="delete" onClick={() => setOpen(true)}>
            <MenuIcon className="text-white"/>
          </IconButton>
          {isCredsAvaialble && (
            <>
              <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
              <Typography
                variant="h6"
                noWrap
                component="a"
                onClick={() => router.push("/")}
                sx={{
                  mr: 5,
                  display: { xs: "none", md: "flex" },
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  color: "inherit",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                {!loading && projectName}
              </Typography>
              {/* <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={() => router.push(page.route)}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page.label}
              </Button>
            ))}
          </Box> */}
            </>
          )}
          {/* <Box sx={{ flexGrow: 0 }}>
          <span className="mr-2">{`version:${version}`}</span>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Log out</Typography>
              </MenuItem>
            </Menu>
          </Box> */}
        </Toolbar>
        <TemporaryDrawer open={open} setOpen={setOpen} />
      </div>
    </AppBar>
  );
}
export default Navbar;
