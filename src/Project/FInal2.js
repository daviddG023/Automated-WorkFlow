import React, { useEffect, useState ,useRef, Component } from 'react';
import './WorkFlowComponent.css';
import Papa from 'papaparse';
import logo from './orange1.png';

import { processCSVAndGenerateExcel } from './CsvColor';
class Workflow {
    constructor(workflowData) {
        this.workflowData = [...workflowData];
        this.currentDay = 1;
        this.logs = []; // Store logs to display in the UI

        this.BE = new State();
        this.M1 = new State();
        this.M2 = new State();
        this.QC1 = new QC();
        this.QC2 = new QC();
        this.QC3 = new QC();
    }

    check() {
        if (this.currentDay === this.BE.days) this.BE.setReset();
        if (this.currentDay === this.M1.days) this.M1.setReset();
        if (this.currentDay === this.M2.days) this.M2.setReset();
        if (this.currentDay === this.QC1.days) this.QC1.setReset();
        if (this.currentDay === this.QC2.days) this.QC2.setReset();
        if (this.currentDay === this.QC3.days) this.QC3.setReset();
    }

    test(props) {
        for (; this.currentDay <= props+.5; this.currentDay += 0.5) {
            this.check();
            for (let s of this.workflowData) {
                if (s[1] !== "") {
                    if (!this.BE.flag) {
                        this.BE.set(true, this.currentDay + parseFloat(s[1]), s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `Backend API Team working on (${s[1]} days)` });
                        s[1] = ""; 
                    }
                } else if (s[2] !== "") {
                    if (!this.M1.flag && this.BE.name !== s[0]) {
                        this.M1.set(true, this.currentDay + parseFloat(s[2]), s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `Mobile Developer 1 working on (${s[2]} days)` });
                        s[2] = "";
                    } else if (!this.M2.flag && this.BE.name !== s[0]) {
                        this.M2.set(true, this.currentDay + parseFloat(s[2]), s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `Mobile Developer 2 working on (${s[2]} days)` });
                        s[2] = "";
                    }
                }
                if (s[3] !== "") {
                    if (!this.QC1.flag) {
                        this.QC1.set(true, this.currentDay + parseFloat(s[3]), s[0], s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `QC Member 1 creating QC for (${s[3]} days)` });
                        s[3] = "";
                    } else if (!this.QC2.flag) {
                        this.QC2.set(true, this.currentDay + parseFloat(s[3]), s[0], s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `QC Member 2 creating QC for (${s[3]} days)` });
                        s[3] = "";
                    } else if (!this.QC3.flag) {
                        this.QC3.set(true, this.currentDay + parseFloat(s[3]), s[0], s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `QC Member 3 creating QC for (${s[3]} days)` });
                        s[3] = "";
                    }
                } else if (s[1] === "" && s[2] === "" && s[4] !== "" && (this.M1.name !== s[0] && this.M2.name !== s[0])) {
                    if (!this.QC1.flag && this.QC1.qcCreator.includes(s[0])) {
                        this.QC1.set(true, this.currentDay + parseFloat(s[4]), s[0], s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `QC Member 1 executing QC for (${s[4]} days)` });
                        s[4] = "";
                    } else if (!this.QC2.flag && this.QC2.qcCreator.includes(s[0])) {
                        this.QC2.set(true, this.currentDay + parseFloat(s[4]), s[0], s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `QC Member 2 executing QC for (${s[4]} days)` });
                        s[4] = "";
                    } else if (!this.QC3.flag && this.QC3.qcCreator.includes(s[0])) {
                        this.QC3.set(true, this.currentDay + parseFloat(s[4]), s[0], s[0]);
                        this.logs.push({ day: `Day ${this.currentDay}`, task: s[0], action: `QC Member 3 executing QC for (${s[4]} days)` });
                        s[4] = "";
                    }
                }
            }
        }

        return this.logs;  // Return the logs after generating them

    }        
}




function WorkFlowComponent(props) {
    const [tasksByDay, setTasksByDay] = useState({});
    const [arrayData, setArrayData] = useState([]);
    const [logMessages, setLogMessages] = useState([]);
    const previousColumnsRef = useRef(null);
    const renderedColumnsRef = useRef([]);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);

    const [SprintDays, setSprintDays] = useState(11);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [tableSecondRow, setTableSecondRow] = useState([]);
    const [selectedFileName2, setSelectedFileName2] = useState('');
    const fileInputRef2 = useRef(null);
    const [flag, setFlag] = useState(false);

    const handleFileUpload2 = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFileName2(file.name);
            Papa.parse(file, {
                skipEmptyLines: true,
                complete: function(results) {
                    const data = results.data;
                    console.log("Parsed Data: ", data);

                    // Assuming the first row contains the headers and the second row contains the names
                    const headers = data[0];
                    const secondRow = data[1];

                    setTableHeaders(headers);
                    setTableSecondRow(secondRow);
                    setFlag(true);
                },
                error: function(error) {
                    console.error('Error reading CSV file:', error);
                }
            });
        }
        
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFileName(file.name);
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    const csvData = results.data;

                    const filteredAndMappedData = csvData
                        .filter(row => row["Feature "].trim() !== "")
                        .map(row => [
                            row["Feature "].trim(),
                            row["BE API"].trim(),
                            row["Mobile "].trim(),
                            row["QC Creation"].trim(),
                            row["QC execution"].trim(),
                            row["Priority"].trim(),
                        ]);

                    filteredAndMappedData.sort((a, b) => {
                        if (a[5] === b[5]) {
                            const maxTimeA = Math.max(
                                parseFloat(a[1]) || 0,
                                parseFloat(a[2]) || 0,
                                parseFloat(a[3]) || 0,
                                parseFloat(a[4]) || 0
                            );
                            const maxTimeB = Math.max(
                                parseFloat(b[1]) || 0,
                                parseFloat(b[2]) || 0,
                                parseFloat(b[3]) || 0,
                                parseFloat(b[4]) || 0
                            );
                            return maxTimeB - maxTimeA;
                        }
                        return parseInt(a[5]) - parseInt(b[5]);
                    });

                    setArrayData(filteredAndMappedData);
                    console.log(filteredAndMappedData);
                },
                error: function(error) {
                    console.error('Error reading CSV file:', error);
                }
            });
        }
    };

    const handleChange = (e) => {
        setSprintDays(parseInt(e.target.value, 10));
    };

    const handleReset = () => {
        setArrayData([]);
        setTasksByDay({});
        previousColumnsRef.current = null;
        renderedColumnsRef.current = [];

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (fileInputRef2.current) {
            fileInputRef2.current.value = '';
        }

        setSelectedFileName('');
        setSelectedFileName2('');
        setSprintDays(11);
        setTableHeaders([]);
        setTableSecondRow([]);
        setFlag(false);
    };

    const convertTasksToCSV = (renderedColumns) => {
    let flag = false;
    const header = ['', ...tableHeaders]; // First row from CSV as headers
    const subHeader = ['Days', ...tableSecondRow]; // Second row from CSV as subheadings
    const rows = [];
    
    for (let columns of renderedColumns) {
        if (!flag && columns.day.endsWith("Day 1")) {
            flag = true;
        } else if (flag && columns.day.endsWith("Day 1")) {
            break;
        }
        if(columns.day.trim().split(' ')[1] < SprintDays+1){
            rows.push([
                columns.day,
                columns.BE,
                columns.Android1,
                columns.Android2,
                (columns.Android1||columns.iOS1),
                (columns.Android2||columns.iOS2),
                columns.QC1,
                columns.QC2,
                columns.QC3
            ]);
        }
    }

    // Include both headers and subheadings in the final CSV content
    const csvContent = [header, subHeader, ...rows].map(e => e.join(",")).join("\n");
    return csvContent;
    };


    const downloadCSV = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const workflowData = arrayData;

        const manager = new Workflow(workflowData);
        const generatedLogs = manager.test(SprintDays);

        setLogMessages(generatedLogs);

        const tasksByDay = {};

        generatedLogs.forEach((message) => {
            const executionTime = parseFloat(message.action.match(/\((\d+(\.\d+)?) days?\)/)?.[1] || 1);
            const baseTask = {
                day: message.day,
                role: "",
                task: message.task,
                person: "",
            };

            if (message.action.includes("Backend API Team")) {
                baseTask.role = "BE";
                baseTask.person = "sama";
            } else if (message.action.includes("Mobile Developer 1")) {
                baseTask.role = "Android";
                baseTask.person = "Mohamed";
            } else if (message.action.includes("Mobile Developer 2")) {
                baseTask.role = "Android";
                baseTask.person = "Mark Seif";
            } else if (message.action.includes("QC Member 1")) {
                baseTask.role = "QC";
                baseTask.person = "Maryem";
            } else if (message.action.includes("QC Member 2")) {
                baseTask.role = "QC";
                baseTask.person = "Mark";
            } else if (message.action.includes("QC Member 3")) {
                baseTask.role = "QC";
                baseTask.person = "Abdelrahman";
            }

            const startDay = parseFloat(baseTask.day.match(/(\d+(\.\d+)?)/)[0]);

            for (let i = 0; i < executionTime; i += 0.5) {
                const currentDay = `Day ${startDay + i}`;

                if (!tasksByDay[currentDay]) {
                    tasksByDay[currentDay] = {
                        BE: [],
                        Android: [],
                        iOS: [],
                        QC: [],
                    };
                }

                if (baseTask.role === "BE") {
                    tasksByDay[currentDay].BE.push(baseTask.task);
                } else if (baseTask.role === "Android" && baseTask.person === "Mohamed") {
                    tasksByDay[currentDay].Android[0] = baseTask.task;
                } else if (baseTask.role === "Android" && baseTask.person === "Mark Seif") {
                    tasksByDay[currentDay].Android[1] = baseTask.task;
                } else if (baseTask.role === "iOS" && baseTask.person === "Hesham") {
                    tasksByDay[currentDay].iOS[0] = baseTask.task;
                } else if (baseTask.role === "iOS" && baseTask.person === "Mostafa") {
                    tasksByDay[currentDay].iOS[1] = baseTask.task;
                } else if (baseTask.role === "QC" && baseTask.person === "Maryem") {
                    tasksByDay[currentDay].QC[0] = baseTask.task;
                } else if (baseTask.role === "QC" && baseTask.person === "Mark") {
                    tasksByDay[currentDay].QC[1] = baseTask.task;
                } else if (baseTask.role === "QC" && baseTask.person === "Abdelrahman") {
                    tasksByDay[currentDay].QC[2] = baseTask.task;
                }
            }
        });

        setTasksByDay(tasksByDay);
    }, [arrayData]);

    return ( <>
            <div className='m-4 '>
            <Logo />
            <h2>Upload CSV File</h2>
            <div className='text-end'>
                <label className='' style={{fontSize:'20px'}}>Sprint Days:</label>
                <input 
                type="number"
                value={SprintDays}
                onChange={handleChange}
                />    
            </div>

            <div className="d-flex justify-content-between my-2">
                <div className="">

                    <div className='row ' style={{ gap: '5px', flexWrap: 'wrap', marginLeft:'-2px'}}>
                        < input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={() => fileInputRef.current && fileInputRef.current.click()} 
                            className="col-12 col-sm-4 custom-file-upload"
                        >
                            {selectedFileName || "Choose File"}
                        </button>
                        
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload2}
                            ref={fileInputRef2}
                            style={{ display: 'none' }} // Hide the default file input
                        />

                        <button 
                            onClick={()=> fileInputRef2.current && fileInputRef2.current.click()} 
                            className="col-12 col-sm-4 custom-file-upload"
                        >
                            {selectedFileName2 || "Choose Resourses"}
                        </button>

                    </div>
                </div>
                <div className="">
                <button onClick={handleReset} className="col-12 col-sm-4 custom-file-upload reset-button" >Reset</button> 

                </div>
            </div>


        </div>
        <div className="table-container">
            <div className="table-container">
                <table>
                <thead>
                        <tr>
                            <th>Days</th>
                            {tableHeaders.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                        <tr>
                            <th></th>
                            {tableSecondRow.map((member, index) => (
                                <th key={index}>{member}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(tasksByDay)
                            .sort((a, b) => parseFloat(a.match(/(\d+(\.\d+)?)/)[0]) - parseFloat(b.match(/(\d+(\.\d+)?)/)[0]))
                            .map((day, index) => {
                                const dayValue = parseFloat(day.match(/(\d+(\.\d+)?)/)[0]);

                                const currentColumns = {
                                    BE: tasksByDay[day].BE.join(', '),
                                    Android1: tasksByDay[day].Android[0],
                                    Android2: tasksByDay[day].Android[1],
                                    iOS1: tasksByDay[day].iOS[0] || '',
                                    iOS2: tasksByDay[day].iOS[1] || '',
                                    QC1: tasksByDay[day].QC[0] || '',
                                    QC2: tasksByDay[day].QC[1] || '',
                                    QC3: tasksByDay[day].QC[2] || '',
                                };

                                const allColumnsEmpty = Object.values(currentColumns).every(column => column === '');

                                if (
                                    dayValue % 1 !== 0 &&
                                    previousColumnsRef.current &&
                                    currentColumns.BE === previousColumnsRef.current.BE &&
                                    currentColumns.Android1 === previousColumnsRef.current.Android1 &&
                                    currentColumns.Android2 === previousColumnsRef.current.Android2 &&
                                    currentColumns.iOS1 === previousColumnsRef.current.iOS1 &&
                                    currentColumns.iOS2 === previousColumnsRef.current.iOS2 &&
                                    currentColumns.QC1 === previousColumnsRef.current.QC1 &&
                                    currentColumns.QC2 === previousColumnsRef.current.QC2 &&
                                    currentColumns.QC3 === previousColumnsRef.current.QC3
                                ) {
                                    return null;
                                }

                                if (allColumnsEmpty) {
                                    return null;
                                }
                                
                                previousColumnsRef.current = currentColumns;
                                renderedColumnsRef.current.push({ ...currentColumns, day }); // Store the current columns
                                if(dayValue < SprintDays+1){return (
                                    <tr className='table-container' key={index}>
                                        <td>{day}</td>
                                        <td>{currentColumns.BE}</td>
                                        <td>{currentColumns.Android1}</td>
                                        <td>{currentColumns.Android2}</td>
                                        <td>{currentColumns.iOS1 || currentColumns.Android1}</td>
                                        <td>{currentColumns.iOS2 || currentColumns.Android2}</td>
                                        <td>{currentColumns.QC1}</td>
                                        <td>{currentColumns.QC2}</td>
                                        <td>{currentColumns.QC3}</td>
                                    </tr>
                                );}
                            })}
                    </tbody>
                </table>
            </div>
                <button 
                    className="download-button"
                    onClick={() => {
                        const csvContent = convertTasksToCSV(renderedColumnsRef.current);
                        //downloadCSV(csvContent, "tasks.csv");
                        processCSVAndGenerateExcel(csvContent,flag);
                    }}
                    disabled={logMessages.length === 0}
                    style={{width:'100%'}}>
                    Download
                </button>
        </div>        

    </>

    );
}
export default WorkFlowComponent;











function Logo() {
    return (
        <div>
            <img src={logo} alt="Logo" style={{ width: '150px', height: 'auto' }} />
        </div>
    );
}


class State {
    constructor() {
        this.flag = false;
        this.days = 0;
        this.name = "";
    }

    set(flag, days, name) {
        this.flag = flag;
        this.days = days;
        this.name = name;
    }

    setReset() {
        this.flag = false;
        this.days = 0;
        this.name = "";
    }
}

class QC extends State {
    constructor() {
        super();
        this.qcCreator = new Array(); 
    }

    set(flag, days, name, creator) {
        super.set(flag, days, name);
        if (!this.qcCreator.includes(creator)) {
            this.qcCreator.push(creator); // Push the creator into the array
        }
    }
    setReset() {
        super.setReset();
    }
}
