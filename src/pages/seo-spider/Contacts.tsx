import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Search, Phone, Mail, MoreVertical, UserPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Contacts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const contacts = [
    { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', status: 'lead', source: 'Website', lastContact: '2024-03-15' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678', status: 'customer', source: 'Referral', lastContact: '2024-03-14' },
    { id: '3', name: 'Mike Williams', email: 'mike.w@email.com', phone: '(555) 345-6789', status: 'prospect', source: 'Google', lastContact: '2024-03-12' },
    { id: '4', name: 'Emily Davis', email: 'emily.d@email.com', phone: '(555) 456-7890', status: 'customer', source: 'Website', lastContact: '2024-03-10' },
  ];

  const filteredContacts = contacts.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const stats = [
    { label: 'Total Contacts', value: '156', Icon: Users, color: 'text-primary' },
    { label: 'Customers', value: '89', badge: 'C', badgeColor: 'text-green-500 bg-green-500/10' },
    { label: 'Leads', value: '42', badge: 'L', badgeColor: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Prospects', value: '25', badge: 'P', badgeColor: 'text-yellow-500 bg-yellow-500/10' },
  ];

  return (
    <>
      <Helmet>
        <title>Contacts | AVA SEO</title>
        <meta name="description" content="Manage your customer contacts and leads." />
      </Helmet>
      <DashboardLayout>
        <PageHeader title="Contacts" description="Manage your customers and leads" icon={Users}>
          <Button className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
            <UserPlus className="w-4 h-4 mr-2" />Add Contact
          </Button>
        </PageHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center">
                      {stat.Icon ? <stat.Icon className={`w-5 h-5 ${stat.color}`} /> : <span className={`text-sm font-bold ${stat.badgeColor}`}>{stat.badge}</span>}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary/30 border-border/50" />
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {filteredContacts.map((contact, index) => (
                  <div key={contact.id} className="p-4 hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex items-center gap-4">
                      <Avatar className="border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-red-600 text-primary-foreground font-semibold">{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{contact.name}</h3>
                          <Badge className={contact.status === 'customer' ? 'bg-green-500/10 text-green-500' : contact.status === 'lead' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-muted text-muted-foreground'}>{contact.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-muted-foreground">{contact.source}</p>
                        <p className="text-xs text-muted-foreground">Last: {contact.lastContact}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="hover:bg-primary/10"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Contacts;
