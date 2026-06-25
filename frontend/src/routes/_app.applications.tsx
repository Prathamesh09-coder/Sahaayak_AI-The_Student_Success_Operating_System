import { createFileRoute } from "@tanstack/react-router";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { FolderKanban, MoreHorizontal, Building2 } from "lucide-react";

export const Route = createFileRoute("/_app/applications")({
  head: () => ({ meta: [{ title: "Application Tracker · Sahaayak AI" }] }),
  component: ApplicationsKanban,
});

const initialData = {
  columns: {
    SAVED: { id: "SAVED", title: "Saved", applicationIds: ["app1"] },
    APPLIED: { id: "APPLIED", title: "Applied", applicationIds: ["app2"] },
    INTERVIEW: {
      id: "INTERVIEW",
      title: "Interview",
      applicationIds: ["app3"],
    },
    OFFERED: { id: "OFFERED", title: "Offer", applicationIds: [] },
    REJECTED: { id: "REJECTED", title: "Rejected", applicationIds: [] },
  },
  applications: {
    app1: {
      id: "app1",
      title: "Software Engineering Intern",
      company: "Google",
    },
    app2: { id: "app2", title: "Frontend Developer", company: "Atlassian" },
    app3: { id: "app3", title: "Product Manager", company: "Microsoft" },
  },
  columnOrder: ["SAVED", "APPLIED", "INTERVIEW", "OFFERED", "REJECTED"],
};

function ApplicationsKanban() {
  const [data, setData] = useState(initialData);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const startColumn =
      data.columns[source.droppableId as keyof typeof data.columns];
    const finishColumn =
      data.columns[destination.droppableId as keyof typeof data.columns];

    if (startColumn === finishColumn) {
      const newAppIds = Array.from(startColumn.applicationIds);
      newAppIds.splice(source.index, 1);
      newAppIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, applicationIds: newAppIds };
      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    // Moving to different column
    const startAppIds = Array.from(startColumn.applicationIds);
    startAppIds.splice(source.index, 1);
    const newStartCol = { ...startColumn, applicationIds: startAppIds };

    const finishAppIds = Array.from(finishColumn.applicationIds);
    finishAppIds.splice(destination.index, 0, draggableId);
    const newFinishCol = { ...finishColumn, applicationIds: finishAppIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStartCol.id]: newStartCol,
        [newFinishCol.id]: newFinishCol,
      },
    });

    // In real app, call API to update status here
    // updateStatusAPI(draggableId, newFinishCol.id);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FolderKanban className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              Application Tracker
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your internship and scholarship applications.
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-max h-full">
            {data.columnOrder.map((columnId) => {
              const column =
                data.columns[columnId as keyof typeof data.columns];
              const apps = column.applicationIds.map(
                (id) => data.applications[id as keyof typeof data.applications],
              );

              return (
                <div
                  key={column.id}
                  className="w-80 flex flex-col glass rounded-2xl p-4 border border-border/50"
                >
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-semibold text-sm">
                      {column.title}{" "}
                      <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {apps.length}
                      </span>
                    </h3>
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 space-y-3 min-h-[150px]"
                      >
                        {apps.map((app, index) => (
                          <Draggable
                            key={app.id}
                            draggableId={app.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={
                                  provided.draggableProps
                                    .style as React.CSSProperties
                                }
                                className="bg-background rounded-xl p-4 shadow-sm border border-border/50 hover:border-primary/30 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="size-8 rounded-lg bg-muted grid place-items-center shrink-0">
                                    <Building2 className="size-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm leading-tight">
                                      {app.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {app.company}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
