import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Users, 
  Store, 
  Heart, 
  User, 
  Menu,
  PawPrint,
  LogOut
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "My Pets", href: "/", icon: Home },
  { name: "Pet Sitters", href: "/sitters", icon: Users },
  { name: "Stores & Trainers", href: "/services", icon: Store },
  { name: "Social Feed", href: "/social", icon: Heart },
  { name: "Profile", href: "/profile", icon: User },
];

export function Navigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { logout, user } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <PawPrint className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-foreground">PetPal</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start space-x-3 ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User info and logout */}
      <div className="mt-auto p-6 border-t">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="font-medium text-foreground">{user?.firstName || user?.username}</p>
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start space-x-3 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  const HeaderContent = () => (
    <header className="bg-card shadow-sm p-4 flex items-center justify-between border-b">
      <div className="flex items-center space-x-4">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        )}
        <h2 className="text-2xl font-bold text-foreground">
          {navigation.find(nav => nav.href === location)?.name || "My Pets Dashboard"}
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">Welcome back!</span>
      </div>
    </header>
  );

  return (
    <>
      {!isMobile && (
        <div className="w-64 bg-card shadow-lg fixed h-full z-30">
          <SidebarContent />
        </div>
      )}
      <div className={`${!isMobile ? "ml-64" : ""}`}>
        <HeaderContent />
      </div>
    </>
  );
}
