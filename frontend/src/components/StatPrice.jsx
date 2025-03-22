import React, { useState, useEffect, useRef } from 'react';
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
    const [chartsLoaded, setChartsLoaded] = useState(false);
    const chartRef = useRef(null);
    const [stats, setStats] = useState({
        totalPrice: 0,
        totalHours: 0,
        taskStats: [],
        projectStats: [],
        detailedProjectStats: []
    });

    // Function to round to two decimals
    const roundToDecimal = (value) => Number(Math.round(value + 'e2') + 'e-2');

    // Initialize Google Charts
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
                        packages: ['corechart']
                    });
                    window.google.charts.setOnLoadCallback(() => {
                        console.log('Google Charts initialized successfully');
                        setChartsLoaded(true);
                        resolve();
                    });
                });
            } catch (err) {
                console.error('Error initializing Google Charts:', err);
            }
        };

        loadGoogleCharts();
    }, []);

    const drawCharts = (detailedStats) => {
        if (!chartRef.current || !window.google || !window.google.visualization) {
            console.log('Waiting for chart container or Google Charts...');
            return;
        }

        try {
            const detailedData = new window.google.visualization.DataTable();
            detailedData.addColumn('string', 'Project');

            // Collect all unique tasks with their colors
            const uniqueTasks = new Map();
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

            // Add a column for each unique task
            uniqueTasks.forEach((value, taskName) => {
                detailedData.addColumn('number', taskName);
            });

            // Prepare data for the chart
            const detailedChartData = detailedStats.map(proj => {
                const row = [proj.projectName];
                // Initialize all values to 0
                for (let i = 0; i < uniqueTasks.size; i++) {
                    row.push(0);
                }
                // Fill task costs in correct positions
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
                // title: 'Cost Distribution by Task',
                titleTextStyle: { fontSize: 16 },
                isStacked: true,
                width: '100%',
                height: 400,
                hAxis: {
                    title: 'Projects',
                    textStyle: { fontSize: 12 }
                },
                vAxis: {
                    title: 'Costs',
                    format: '#,##0.00',
                    textStyle: { fontSize: 12 }
                },
                colors: Array.from(uniqueTasks.values()).map(task => task.color),
                backgroundColor: '#ffffff',
                chartArea: { width: '80%', height: '70%' }
            };

            const detailedChart = new window.google.visualization.ColumnChart(chartRef.current);
            detailedChart.draw(detailedData, detailedOptions);

        } catch (error) {
            console.error('Error drawing charts:', error);
        }
    };

    // Load data
    useEffect(() => {
        const fetchStats = async () => {
            if (!chartsLoaded) return;

            try {
                if (!projectId) {
                    const projectsResponse = await axios.get(`${API_URL}/projects`);
                    const projects = projectsResponse.data;
                    
                    const detailedStats = await Promise.all(projects.map(async project => {
                        const tasksResponse = await axios.get(`${API_URL}/projects/${project._id}/tasks`);
                        const tasks = tasksResponse.data;
                        
                        const taskDetails = tasks.map(task => ({
                            taskName: task.title,
                            cost: roundToDecimal((task.pricePerHour || 0) * (task.hoursBilled || 0)),
                            color: task.color
                        }));

                        const totalCost = roundToDecimal(taskDetails.reduce((sum, task) => sum + task.cost, 0));

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

                    // Wait for next render cycle
                    setTimeout(() => {
                        drawCharts(detailedStats);
                    }, 0);
                } else {
                    const response = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
                    const tasks = response.data;

                    const taskStats = tasks.map(task => ({
                        name: task.title,
                        pricePerHour: task.pricePerHour || 0,
                        hoursBilled: task.hoursBilled || 0,
                        totalPrice: roundToDecimal((task.pricePerHour || 0) * (task.hoursBilled || 0))
                    }));

                    const totalPrice = roundToDecimal(taskStats.reduce((sum, task) => sum + task.totalPrice, 0));
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
    }, [projectId, chartsLoaded]);

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
                <>
                    <Paper sx={{ p: 2, mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Project Costs</Typography>
                        <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>
                    </Paper>
                    <Grid container spacing={2}>
                        {stats.detailedProjectStats.map((project, index) => (
                            <Grid item xs={12} key={index}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6">{project.projectName}</Typography>
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                        Total cost: {roundToDecimal(project.totalCost)}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {project.tasks.map((task, taskIndex) => (
                                            <Grid item xs={12} sm={6} md={4} key={taskIndex}>
                                                <Paper sx={{ p: 1 }} elevation={2}>
                                                    <Typography variant="body2">
                                                        {task.taskName}: {roundToDecimal(task.cost)}
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
                <>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Total Hours Billed</Typography>
                                <Typography variant="h4">{stats.totalHours}h</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Total Cost</Typography>
                                <Typography variant="h4">{roundToDecimal(stats.totalPrice)}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Details by Task</Typography>
                        <Grid container spacing={2}>
                            {stats.taskStats.map((task, index) => (
                                <Grid item xs={12} key={index}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle1">{task.name}</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">Price/hour: {task.pricePerHour}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">Hours: {task.hoursBilled}h</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">Total: {roundToDecimal(task.totalPrice)}</Typography>
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