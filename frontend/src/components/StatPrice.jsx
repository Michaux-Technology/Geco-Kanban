import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Grid
} from '@mui/material';

const StatPrice = ({ projectId }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPrice: 0,
        totalHours: 0,
        taskStats: [],
        projectStats: [],
        detailedProjectStats: []
    });

    // Fonction pour arrondir à deux décimales
    const roundToEuro = (value) => Number(Math.round(value + 'e2') + 'e-2');

    const drawCharts = (detailedStats) => {
        try {
            const detailedChartDiv = document.getElementById('detailed_chart_div');

            if (!detailedChartDiv || !window.google || !window.google.visualization) {
                console.log('Waiting for elements and Google Charts to be ready...');
                setTimeout(() => drawCharts(detailedStats), 100);
                return;
            }

            // Graphique : Décomposition par tâche
            const detailedData = new window.google.visualization.DataTable();
            detailedData.addColumn('string', 'Projet');

            // Collecter toutes les tâches uniques avec leurs couleurs
            const uniqueTasks = new Map(); // Map pour stocker les tâches uniques
            detailedStats.forEach(proj => {
                proj.tasks.forEach(task => {
                    if (!uniqueTasks.has(task.taskName)) {
                        uniqueTasks.set(task.taskName, {
                            color: task.color || '#000000',
                            index: uniqueTasks.size
                        });
                    }
                });
            });

            // Ajouter une colonne pour chaque tâche unique
            uniqueTasks.forEach((value, taskName) => {
                detailedData.addColumn('number', taskName);
            });

            // Préparer les données pour le graphique
            const detailedChartData = detailedStats.map(proj => {
                const row = [proj.projectName];
                // Initialiser toutes les valeurs à 0
                for (let i = 0; i < uniqueTasks.size; i++) {
                    row.push(0);
                }
                // Remplir les coûts des tâches aux bonnes positions
                proj.tasks.forEach(task => {
                    const taskInfo = uniqueTasks.get(task.taskName);
                    if (taskInfo) {
                        row[taskInfo.index + 1] = task.cost;
                    }
                });
                return row;
            });

            detailedData.addRows(detailedChartData);

            const detailedOptions = {
                title: '',
                titleTextStyle: { fontSize: 16 },
                isStacked: true,
                hAxis: {
                    title: 'Projets',
                    textStyle: { fontSize: 12 }
                },
                vAxis: {
                    title: 'costs',
                    format: '#,##0.00',
                    textStyle: { fontSize: 12 }
                },
                colors: Array.from(uniqueTasks.values()).map(task => task.color)
            };

            const detailedChart = new window.google.visualization.ColumnChart(detailedChartDiv);
            detailedChart.draw(detailedData, detailedOptions);
        } catch (error) {
            console.error('Error drawing charts:', error);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (!projectId) {
                    const projectsResponse = await axios.get(`${API_URL}/projects`);
                    const projects = projectsResponse.data;
                    
                    const detailedStats = await Promise.all(projects.map(async project => {
                        const tasksResponse = await axios.get(`${API_URL}/projects/${project._id}/tasks`);
                        const tasks = tasksResponse.data;
                        
                        const taskDetails = tasks.map(task => ({
                            taskName: task.title,
                            cost: roundToEuro((task.pricePerHour || 0) * (task.hoursBilled || 0)),
                            color: task.color
                        }));

                        const totalCost = roundToEuro(taskDetails.reduce((sum, task) => sum + task.cost, 0));

                        return {
                            projectName: project.title,
                            totalCost: totalCost,
                            tasks: taskDetails
                        };
                    }));

                    setStats(prev => ({
                        ...prev,
                        projectStats: detailedStats.map(proj => ({
                            projectName: proj.projectName,
                            totalCost: proj.totalCost
                        })),
                        detailedProjectStats: detailedStats
                    }));

                    // Attendre que Google Charts soit chargé
                    window.google.charts.setOnLoadCallback(() => {
                        setTimeout(() => drawCharts(detailedStats), 100);
                    });
                } else {
                    // Code existant pour un projet spécifique
                    const response = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
                    const tasks = response.data;

                    const taskStats = tasks.map(task => ({
                        name: task.title,
                        pricePerHour: task.pricePerHour || 0,
                        hoursBilled: task.hoursBilled || 0,
                        totalPrice: roundToEuro((task.pricePerHour || 0) * (task.hoursBilled || 0))
                    }));

                    const totalPrice = roundToEuro(taskStats.reduce((sum, task) => sum + task.totalPrice, 0));
                    const totalHours = taskStats.reduce((sum, task) => sum + task.hoursBilled, 0);

                    setStats({
                        totalPrice,
                        totalHours,
                        taskStats,
                        projectStats: [],
                        detailedProjectStats: []
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching statistics:', error);
                setLoading(false);
            }
        };

        fetchStats();

        // Réinitialiser les graphiques lors du démontage du composant
        return () => {
            const detailedChartDiv = document.getElementById('detailed_chart_div');
            if (detailedChartDiv) detailedChartDiv.innerHTML = '';
        };
    }, [projectId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            {!projectId ? (
                // Vue globale pour tous les projets
                <>
                    <Paper sx={{ p: 2, mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Project costs</Typography>
                        <div id="detailed_chart_div" style={{ width: '100%', height: '400px' }}></div>
                    </Paper>
                    <Grid container spacing={2}>
                        {stats.detailedProjectStats.map((project, index) => (
                            <Grid item xs={12} key={index}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6">{project.projectName}</Typography>
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                        Coût total: {roundToEuro(project.totalCost)}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {project.tasks.map((task, taskIndex) => (
                                            <Grid item xs={12} sm={6} md={4} key={taskIndex}>
                                                <Paper sx={{ p: 1 }} elevation={2}>
                                                    <Typography variant="body2">
                                                        {task.taskName}: {roundToEuro(task.cost)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </>
            ) : (
                // Vue détaillée pour un projet spécifique
                <>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Total des heures facturées</Typography>
                                <Typography variant="h4">{stats.totalHours}h</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Montant total</Typography>
                                <Typography variant="h4">{roundToEuro(stats.totalPrice)}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Détails par tâche</Typography>
                        <Grid container spacing={2}>
                            {stats.taskStats.map((task, index) => (
                                <Grid item xs={12} key={index}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle1">{task.name}</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">Prix/heure: {task.pricePerHour}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">Heures: {task.hoursBilled}h</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">Total: {roundToEuro(task.totalPrice)}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default StatPrice; 