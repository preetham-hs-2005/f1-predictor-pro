import React, { useState } from "react";
import { useDrivers } from "@/hooks/useDrivers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { Driver } from "@/lib/api/drivers";

const AdminDrivers = () => {
  const { drivers, isLoading, addDriver, updateDriver, deleteDriver } = useDrivers(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Driver>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (driver: Driver) => {
    setEditingId(driver.id);
    setFormData(driver);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setEditingId("new");
    setFormData({
      id: "",
      name: "",
      team: "",
      number: 0,
      country: "",
      countryFlag: "",
      teamColor: "#000000",
      isActive: true,
    });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setIsAdding(false);
  };

  const handleChange = (field: keyof Driver, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isAdding) {
      const added = await addDriver(formData as Omit<Driver, "_id">);
      if (added) cancelEdit();
    } else if (editingId) {
      const updated = await updateDriver(editingId, formData);
      if (updated) cancelEdit();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This could affect historical predictions.`)) {
      await deleteDriver(id);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8 text-muted-foreground">Loading drivers...</div>;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center bg-background/30 p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="f1-heading text-xl">Driver Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add or edit drivers on the 2026 grid. Active drivers appear in the prediction form.
          </p>
        </div>
        <Button onClick={handleAdd} disabled={editingId !== null} className="gap-2">
          <Plus className="h-4 w-4" /> Add Driver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* ADD / EDIT FORM CARD */}
        {editingId === "new" && (
          <div className="glass p-5 rounded-xl border-accent/50 border-2 relative">
            <h3 className="font-bold mb-4">Add New Driver</h3>
            <div className="space-y-3">
               <div>
                  <Label>Short ID (e.g. 'ver')</Label>
                  <Input value={formData.id} onChange={e => handleChange('id', e.target.value)} placeholder="ver" className="h-8 text-sm" />
               </div>
               <div>
                  <Label>Full Name</Label>
                  <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="Max Verstappen" className="h-8 text-sm" />
               </div>
               <div>
                  <Label>Team</Label>
                  <Input value={formData.team} onChange={e => handleChange('team', e.target.value)} placeholder="Red Bull Racing" className="h-8 text-sm" />
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <Label>Number</Label>
                    <Input type="number" value={formData.number} onChange={e => handleChange('number', parseInt(e.target.value))} className="h-8 text-sm" />
                 </div>
                 <div>
                    <Label>Color Hex</Label>
                    <div className="flex items-center gap-2">
                       <Input type="color" value={formData.teamColor} onChange={e => handleChange('teamColor', e.target.value)} className="h-8 w-8 p-0 border-0" />
                       <Input value={formData.teamColor} onChange={e => handleChange('teamColor', e.target.value)} className="h-8 text-sm" />
                    </div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <Label>Country</Label>
                    <Input value={formData.country} onChange={e => handleChange('country', e.target.value)} placeholder="Netherlands" className="h-8 text-sm" />
                 </div>
                 <div>
                    <Label>Flag Emoji</Label>
                    <Input value={formData.countryFlag} onChange={e => handleChange('countryFlag', e.target.value)} placeholder="🇳🇱" className="h-8 text-sm" />
                 </div>
               </div>
               <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <Label>Active</Label>
                  <Switch checked={formData.isActive} onCheckedChange={checked => handleChange('isActive', checked)} />
               </div>
               
               <div className="flex gap-2 pt-2">
                 <Button onClick={handleSave} size="sm" className="w-full gap-1"><Check className="h-4 w-4"/> Save</Button>
                 <Button onClick={cancelEdit} size="sm" variant="outline" className="w-full gap-1"><X className="h-4 w-4"/> Cancel</Button>
               </div>
            </div>
          </div>
        )}

        {/* LIST CARDS */}
        {drivers.map(driver => (
          editingId === driver.id && !isAdding ? (
            <div key={`edit-${driver.id}`} className="glass p-5 rounded-xl border-accent/50 border-2 relative">
              <h3 className="font-bold mb-4">Edit Driver: {driver.id}</h3>
              <div className="space-y-3">
                <div>
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                    <Label>Team</Label>
                    <Input value={formData.team} onChange={e => handleChange('team', e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                      <Label>Number</Label>
                      <Input type="number" value={formData.number} onChange={e => handleChange('number', parseInt(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div>
                      <Label>Color Hex</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={formData.teamColor} onChange={e => handleChange('teamColor', e.target.value)} className="h-8 w-8 p-0 border-0" />
                        <Input value={formData.teamColor} onChange={e => handleChange('teamColor', e.target.value)} className="h-8 text-sm" />
                      </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                      <Label>Country</Label>
                      <Input value={formData.country} onChange={e => handleChange('country', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                      <Label>Flag Emoji</Label>
                      <Input value={formData.countryFlag} onChange={e => handleChange('countryFlag', e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <Label>Active (Shows on predictor)</Label>
                  <Switch checked={formData.isActive} onCheckedChange={checked => handleChange('isActive', checked)} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} size="sm" className="w-full gap-1"><Check className="h-4 w-4"/> Save</Button>
                  <Button onClick={cancelEdit} size="sm" variant="outline" className="w-full gap-1"><X className="h-4 w-4"/> Cancel</Button>
                </div>
              </div>
            </div>
          ) : (
            <div key={driver.id} className={`glass p-5 rounded-xl flex flex-col justify-between ${!driver.isActive ? 'opacity-50' : ''} border-l-4`} style={{ borderLeftColor: driver.teamColor || '#333' }}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{driver.countryFlag}</span>
                    <h3 className="font-bold text-lg leading-none">{driver.name}</h3>
                  </div>
                  <span className="text-xs font-mono bg-background/50 px-2 py-1 rounded text-muted-foreground">#{driver.number}</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-4">{driver.team}</p>
                <div className="flex text-xs text-muted-foreground gap-4">
                  <span>ID: {driver.id}</span>
                  {!driver.isActive && <span className="text-red-400">Inactive</span>}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                <Button onClick={() => handleEdit(driver)} disabled={editingId !== null} variant="outline" size="sm" className="w-full gap-1 text-xs">
                  <Edit2 className="h-3 w-3" /> Edit
                </Button>
                <Button onClick={() => handleDelete(driver.id, driver.name)} disabled={editingId !== null} variant="destructive" size="sm" className="w-full gap-1 text-xs">
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default AdminDrivers;
