import React, { useState, useEffect, useRef } from 'react';

const GanttChart = ({ tasks }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  // Chargement initial de Google Charts
  useEffect(() => {
    const loadGoogleCharts = async () => {
      try {
        if (typeof window.google === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://www.gstatic.com/charts/loader.js';
          script.async = true;
          document.head.appendChild(script);
          
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        await new Promise((resolve) => {
          window.google.charts.load('current', {
            packages: ['gantt']
          });
          window.google.charts.setOnLoadCallback(() => {
            setIsLoading(false);
            resolve();
          });
        });
      } catch (err) {
        console.error('Erreur lors du chargement de Google Charts:', err);
        setError('Erreur lors du chargement du graphique');
        setIsLoading(false);
      }
    };

    loadGoogleCharts();
  }, []); // Exécuté une seule fois au montage

  // Mise à jour du graphique
  useEffect(() => {
    if (isLoading || error || !tasks.length || !containerRef.current || !window.google?.visualization) {
      return;
    }

    try {
      const data = new window.google.visualization.DataTable();
      data.addColumn('string', 'Task ID');
      data.addColumn('string', 'Task Name');
      data.addColumn('string', 'Resource');
      data.addColumn('date', 'Start Date');
      data.addColumn('date', 'End Date');
      data.addColumn('number', 'Duration');
      data.addColumn('number', 'Percent Complete');
      data.addColumn('string', 'Dependencies');

      const rows = tasks.map((task) => {
        const startDate = new Date(task.begindate);
        const endDate = new Date(task.enddate);
        
        return [
          task._id,
          task.title,
          task.color || '#4285f4', // Utiliser la couleur de la tâche ou une couleur par défaut
          startDate,
          endDate,
          task.workingDay || null,
          task.gauge || 0,
          task.dependencies || null
        ];
      });

      data.addRows(rows);

      const options = {
        height: 400,
        gantt: {
          trackHeight: 30,
          barCornerRadius: 3,
          defaultStartDate: new Date(),
          criticalPathEnabled: false,
          arrow: {
            angle: 100,
            width: 2,
            color: '#2196F3',
            radius: 0
          },
          palette: tasks.map(task => task.color || '#4285f4')
        },
        backgroundColor: '#ffffff'
      };

      if (!chartRef.current) {
        chartRef.current = new window.google.visualization.Gantt(containerRef.current);
      }

      chartRef.current.draw(data, options);

      const handleResize = () => {
        chartRef.current.draw(data, options);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (err) {
      console.error('Erreur lors du rendu du graphique Gantt:', err);
      setError('Erreur lors du rendu du graphique');
    }
  }, [tasks, isLoading, error]); // Dépendances réduites et plus précises

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '4px'
      }}>
        <div>Chargement du graphique...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        color: 'red'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '4px'
      }}
    />
  );
};

export default GanttChart;
