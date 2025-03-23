import React, { useState } from 'react';
import { Scheduler } from "@aldabil/react-scheduler";

export const SchedulerComponent = () => {
  const [events, setEvents] = useState([
    {
      event_id: 1,
      title: "Event 1",
      start: new Date("2021/5/2 09:30"),
      end: new Date("2021/5/2 10:30"),
      teacher_id: "yes",
      subject: "math",
      course: "a",
      section: "g",
    },
    {
      event_id: 2,
      title: "Event 2",
      start: new Date("2021/5/4 10:00"),
      end: new Date("2021/5/4 11:00"),
      teacher_id: "russ",
      subject: "sciendce",
      course: "d",
      section: "j",
    },
  ]);

  const handleConfirm = async (event: any, action: "create" | "edit") => {
    if (action === "create") {
      event.event_id = Date.now();
      setEvents([...events, event]);
      console.log(action, event);
    } else if (action === "edit") {
      setEvents(events.map(e => (e.event_id === event.event_id ? event : e)));
      console.log(action, event);
    }
    return event;
  };

  const handleDelete = async (event_id: any) => {
    setEvents(events.filter((e) => e.event_id !== event_id));
    console.log("Deleted event id:", event_id);
    return Promise.resolve(event_id);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full">
        <Scheduler
          height={600}  // Adjust height as needed
          draggable={false}
          events={events}
          fields={[
            {
              name: "teacher_id",
              type: "select",
              options: [
                { id: 1, text: "Ivor", value: "yes" },
                { id: 2, text: "Russuel", value: "russ" },
                { id: 3, text: "Joshua", value: "josh" },
              ],
              config: { label: "Teacher", required: true, errMsg: "Please select a teacher" }
            },
            {
              name: "subject",
              type: "select",
              options: [
                { id: 1, text: "Math", value: "math" },
                { id: 2, text: "Science", value: "sciendce" },
                { id: 3, text: "English", value: "eng" },
              ],
              config: { label: "Subject", required: true, errMsg: "Please select a subject" }
            },
            {
              name: "course",
              type: "select",
              options: [
                { id: 8, text: "BSIS", value: "a" },
                { id: 7, text: "BSIT", value: "d" },
                { id: 9, text: "BSOM", value: "v" },
              ],
              config: { label: "Course", required: true, errMsg: "Please select a course" }
            },
            {
              name: "section",
              type: "select",
              options: [
                { id: 10, text: "4A", value: "g" },
                { id: 12, text: "4B", value: "j" },
                { id: 13, text: "4C", value: "k" },
              ],
              config: { label: "Section", required: true, errMsg: "Please select a section" }
            },
          ]}
          onConfirm={handleConfirm}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
