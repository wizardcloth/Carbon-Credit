import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase.ts";
import { signOut } from "firebase/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, User, FolderKanban, Wallet, Menu, X } from "lucide-react"; // Added Menu + X icons
import { useEffect, useState } from "react";
import { useAuthStore } from "@/Store/useAuthStore";

export default function ResizableHandleDemo() {
  const [user, setUser] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {isAdmin} = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/unauthorized");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const sidebarItems = [
    { name: "Home", icon: Home, path: "/Dashboard" },
    { name: "Profile", icon: User, path: "/Dashboard/profile" },
    { name: "Projects", icon: FolderKanban, path: "/Dashboard/projects" },
    { name: "Token Wallet", icon: Wallet, path: "/Dashboard/wallet" },
  ];

  if (!user) {
    return null;
  }


  return (
    <>
      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 flex justify-between items-center">
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              {
                isAdmin ? (
                  <Link to="/admin"><h1 className="text-3xl font-bold mb-2 onhover:cursor-pointer hover:underline hover:text-red-300">Welcome, {"Admin"}!</h1></Link>
                ) : (
                  <h1 className="text-3xl font-bold mb-2">Welcome, {"Farmer"}!</h1>
                )
              }
            </div>
            <Button
              onClick={handleSignout}
              className="bg-white text-green-600 hover:bg-gray-100 hover:cursor-pointer mt-4 sm:mt-0 w-30"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 absolute top-4 right-4 border border-white  rounded-lg"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 h-full shadow-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">Menu</h2>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-200"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-green-200 hover:text-green-700 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium ">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overlay background */}
          <div
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Layout */}
      <ResizablePanelGroup direction="horizontal" className="">
        {/* Desktop Sidebar */}
        <ResizablePanel
          defaultSize={15}
          minSize={14}
          maxSize={15}
          className="max-h-[100vh] min-h-[80vh] bg-slate-50 hidden md:block mr-0"
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col mt-6 space-y-2 px-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-green-200 hover:text-green-700 transition-colors hover:cursor-pointer"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </ResizablePanel>

        {/* Resizer */}
        <ResizableHandle withHandle />

        {/* Main Content */}
        <ResizablePanel defaultSize={85}>
          <ScrollArea className="h-[100vh] m-2 rounded-md">
            <div className="">
              <Outlet />
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
