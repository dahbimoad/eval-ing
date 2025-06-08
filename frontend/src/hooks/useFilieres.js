// src/hooks/useFilieres.js
import { useState, useEffect } from 'react';
import { formationService } from '../services/formationService';
import { toast } from 'react-toastify';

export function useFilieres() {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log('Fetching filieres...'); // Debug log
        const list = await formationService.getAll();
        console.log('Filieres response:', list); // Debug log
        
        // Handle different response structures
        let filieresList = [];
        if (Array.isArray(list)) {
          filieresList = list;
        } else if (list && Array.isArray(list.data)) {
          filieresList = list.data;
        } else if (list && Array.isArray(list.items)) {
          filieresList = list.items;
        } else if (list && Array.isArray(list.filieres)) {
          filieresList = list.filieres;
        }
        
        console.log('Processed filieres list:', filieresList); // Debug log
        setFilieres(filieresList);
      } catch (error) {
        console.error('Error fetching filieres:', error); // Debug log
        toast.error('Impossible de charger les filières');
        setFilieres([]); // Ensure it's always an array
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { filieres, loading };
}
