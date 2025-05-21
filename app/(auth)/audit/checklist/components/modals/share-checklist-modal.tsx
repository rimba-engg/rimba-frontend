import { useState, useRef, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "./Avatar";
import { Link, Check, X, Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Checklist } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { User, Team, UserRole, SelectedUser } from "@/lib/types";
import { api } from "@/lib/api";
export type UserRole = "ADMIN" | "USER" | "SUPER_ADMIN"| "AUDITOR";
export interface SelectedUser extends User {
    selected?: boolean;
}

export interface AllowedUser extends User {
  role: UserRole;
}

export interface Team {
  id: string;
  name: string;
  memberCount: number;
}

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist: Checklist;
}

// Mock data for demonstration
const mockTeams: Team[] = [
  { id: "1", name: "Product Team", memberCount: 4 },
];

// const mockAllMembers: (User & { role: UserRole })[] = [
//   { id: "1", email: "akshay@example.com", first_name: "Akshay", last_name: "Sharma", role: "Project admin" },
//   { id: "2", email: "ankit@example.com", first_name: "Ankit", last_name: "Bharti", role: "Editor" },
//   { id: "3", email: "lokesh@example.com", first_name: "Lokesh", last_name: "Danu", role: "Editor" },
//   { id: "4", email: "timothy@example.com", first_name: "Timothy", last_name: "Daniel", role: "Project admin" },
//   { id: "5", email: "tria@example.com", first_name: "Tria", last_name: "Nandya", role: "Editor" },
// ];



export const ShareChecklistModal = ({ open, onOpenChange, checklist}: ShareModalProps) => {
  const [email, setEmail] = useState("");
  const [notifyOnTaskAdd, setNotifyOnTaskAdd] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(mockTeams[0].id);
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
  const linkRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [defaultRole, setDefaultRole] = useState<UserRole>("USER");

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [AllUsers, setAllUsers] = useState<User[]>([]);

  const [isInviting, setIsInviting] = useState(false);

  const fetchAllowedUsers = async () => {
    const response = await api.get<{
      active_users: Array<{
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        status: string;
      }>;
      inactive_users: Array<any>;
    }>(`/audit/v2/allowed_user_list/${checklist.id}`);
    if (response.active_users) {
        console.log(` fetchAllowedUsers response.active_users`, response.active_users);
      setAllowedUsers(response.active_users.map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role as UserRole
      })));
    }
  };

  
  const fetchAllUsers = async () => {
    const response = await api.get<{
      message: string;
      data: Array<{
        _id: string;
        email: string;
        first_name: string;
        last_name: string;
        is_active: boolean;
        id: string;
      }>;
      status: number;
    }>("/audit/v2/users/all/");
    
    if (response.data) {
      setAllUsers(response.data.map((user) => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      })));
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllowedUsers();
  }, []);

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The project link has been copied to clipboard.",
      duration: 3000,
    });
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) return;
    setIsInviting(true);
    const user_ids = selectedUsers.map((user) => user.id);
    try {
      const response = await api.post<{
        message: string;
        status: string;
      }>("/audit/v2/checklist/grant-access/", {
        checklist_id: checklist.id,
        user_ids: user_ids,
      });
      
      if (response.status === 'success') {
        toast({
          title: "Invitation sent!",
          description: `An invitation has been sent to ${email}`,
          duration: 3000,
        });
        await fetchAllowedUsers();
      } else {
        toast({
          title: "Error",
          description: response.message,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitations",
      });
    } finally {
      setIsInviting(false);
      setEmail("");
      setSelectedUsers([]);
    }
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    // In a real app, this would update the user's role
    console.log(`Changed ${userId}'s role to ${role}`);
  };

  useEffect(() => {
    console.log(AllUsers);
    setFilteredUsers(AllUsers.filter(user => 
      !selectedUsers.some(selected => selected.id === user.id) && 
      (user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
  }, [AllUsers, selectedUsers, searchQuery]);

  const handleAddUser = (user: User) => {
    setSelectedUsers(prev => [...prev, { ...user, role: defaultRole }]);
    setSearchQuery("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Share {checklist.name}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100" />
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Invite Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-medium">Add members</h3>
            <div className="flex gap-2">
              {/* <div className="flex-1">
                <Input 
                  placeholder="Add members by name or email..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Select defaultValue="Editor"> */}
              <div className="flex-1 relative">
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Input 
                        placeholder="Add members by name or email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={() => setIsSearchOpen(true)}
                        className="pr-8"
                      />
                      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search users..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {filteredUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => {
                                handleAddUser(user);
                                setIsSearchOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Avatar user={user} />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {/* <Select value={defaultRole} onValueChange={(value) => setDefaultRole(value as UserRole)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Project admin">Project admin</SelectItem>
                </SelectContent>
              </Select> */}
              <Button 
                onClick={handleInvite} 
                disabled={selectedUsers.length === 0 || isInviting}
              >
                {isInviting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Inviting...
                  </div>
                ) : "Invite"}
              </Button>
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-1 bg-gray-100 rounded-full pl-1 pr-2 py-1">
                    <Avatar user={user} />
                    <span className="text-sm">{user.first_name} {user.last_name}</span>
                    {/* <span className="text-xs text-gray-500 mr-1">({user.role})</span> */}
                    <button 
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* <div className="flex items-center space-x-2">
              <Checkbox 
                id="notify" 
                checked={notifyOnTaskAdd}
                onCheckedChange={(checked) => setNotifyOnTaskAdd(checked as boolean)}
              />
              <label htmlFor="notify" className="text-sm">
                Notify when tasks are added to the project
              </label>
            </div> */}
          </div>

          {/* Access Settings */}
          {/* <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-medium">Access settings</h3>
            <div>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{team.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div> */}

          {/* Members List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Members</h3>
              {/* <Button variant="link" className="text-blue-600">
                Manage notifications
              </Button> */}
            </div>

            <div className="space-y-2">
              {/* <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar user={allowedUsers[0]} />
                  <div>
                    <div className="font-medium">Task collaborators</div>
                  </div>
                </div>
                <Select defaultValue="Editor">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Project admin">Project admin</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {allowedUsers.map((user) => (
                <div key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar user={user} />
                    <div>
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                        <span className="ml-6 text-xs bg-gray-100 px-2 py-1 rounded-md">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* <Select 
                    defaultValue={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Project admin">Project admin</SelectItem>
                    </SelectContent>
                  </Select> */}
                </div>
              ))}
            </div>
          </div>

          {/* Copy Link Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleCopyLink} 
              variant="outline" 
              className="flex items-center gap-2 border-2 border-dashed"
            >
              <Link size={16} />
              Copy project link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};