import { useState, useCallback, useEffect } from "react";
import { driversApi, Driver } from "@/lib/api/drivers";
import { useToast } from "@/components/ui/use-toast";

export const useDrivers = (fetchAll: boolean = false) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDrivers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await driversApi.getAll(fetchAll);
      setDrivers(data);
    } catch (err: any) {
      console.error("Failed to fetch drivers:", err);
      setError(err.message || "Failed to fetch drivers");
      toast({
        title: "Error",
        description: "Failed to load drivers data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchAll, toast]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const addDriver = useCallback(async (driver: Omit<Driver, "_id">) => {
    try {
      const response = await driversApi.create(driver);
      if (response.success && response.data) {
        setDrivers(prev => [...prev, response.data].sort((a, b) => a.team.localeCompare(b.team) || a.name.localeCompare(b.name)));
        toast({
          title: "Success",
          description: "Driver added successfully",
        });
        return true;
      }
      return false;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to add driver",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const updateDriver = useCallback(async (id: string, updates: Partial<Driver>) => {
    try {
      const response = await driversApi.update(id, updates);
      if (response.success && response.data) {
        setDrivers(prev => prev.map(d => d.id === id ? response.data : d));
        toast({
          title: "Success",
          description: "Driver updated successfully",
        });
        return true;
      }
      return false;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to update driver",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const deleteDriver = useCallback(async (id: string) => {
    try {
      const response = await driversApi.delete(id);
      if (response.success) {
        setDrivers(prev => prev.filter(d => d.id !== id));
        toast({
          title: "Success",
          description: "Driver deleted successfully",
        });
        return true;
      }
      return false;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to delete driver",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const getDriverById = useCallback((id: string) => {
    return drivers.find(d => d.id === id);
  }, [drivers]);

  return {
    drivers,
    isLoading,
    error,
    refetch: fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById
  };
};
