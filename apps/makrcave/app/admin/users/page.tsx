import { Users, UserPlus, Shield, Mail, Calendar } from 'lucide-react';

export default function AdminUsers() {
  const users = [
    { id: '1', name: 'John User', email: 'john@makrx.org', role: 'user', joinDate: '2024-01-15', lastActive: '2024-01-26' },
    { id: '2', name: 'Sarah Designer', email: 'sarah@makrx.org', role: 'user', joinDate: '2024-01-10', lastActive: '2024-01-25' },
    { id: '3', name: 'Mike Creator', email: 'mike@makrx.org', role: 'makerspace_admin', joinDate: '2024-01-05', lastActive: '2024-01-26' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage makerspace members and permissions
          </p>
        </div>
        <button className="makrcave-btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      <div className="makrcave-card">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Join Date</th>
                <th className="text-left py-3 px-4">Last Active</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-makrx-teal rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'makerspace_admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{user.joinDate}</td>
                  <td className="py-3 px-4 text-sm">{user.lastActive}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="p-1 text-makrx-blue hover:bg-makrx-blue/10 rounded">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-makrx-blue hover:bg-makrx-blue/10 rounded">
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-makrx-teal rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="p-2 text-makrx-blue hover:bg-makrx-blue/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-makrx-blue hover:bg-makrx-blue/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">Role</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'makerspace_admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-xs font-medium mb-1">Joined</p>
                  <p className="text-gray-900 text-xs">{user.joinDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs font-medium mb-1">Last Active</p>
                  <p className="text-gray-900 text-xs">{user.lastActive}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
