import { useState } from "react";
import CapstoneTalkingPoints from "./CapstoneTalkingPoints.jsx";
import ConsistencyTab from "./ConsistencyTab.jsx";
import FailureModesTab from "./FailureModesTab.jsx";
import GeneratedOutputTab from "./GeneratedOutputTab.jsx";
import WorkflowTab from "./WorkflowTab.jsx";

const tabs = [
  { id: "workflow", label: "Workflow", Component: WorkflowTab },
  { id: "consistency", label: "Consistency", Component: ConsistencyTab },
  { id: "failures", label: "Failure Modes", Component: FailureModesTab },
  { id: "generated", label: "Generated Output", Component: GeneratedOutputTab },
];

export default function ResultsTabs({ result, initialTab = "workflow" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const ActiveComponent = currentTab.Component;

  return (
    <section className="resultsPanel" aria-label="Analysis results">
      <div className="tabs" role="tablist" aria-label="Result sections">
        {tabs.map((tab) => (
          <button
            aria-controls={`${tab.id}-panel`}
            aria-selected={tab.id === activeTab}
            className="tabButton"
            id={`${tab.id}-tab`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`${currentTab.id}-tab`}
        className="tabContent"
        id={`${currentTab.id}-panel`}
        role="tabpanel"
      >
        <ActiveComponent result={result} />
      </div>

      <CapstoneTalkingPoints result={result} />
    </section>
  );
}
