'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";
import { api } from "@/lib/api";
import { UserData, UserListResponse } from "../../user-management/types";
import { useEffect, useState } from "react";

interface Requirement {
  section: string;
  regulation: string;
  guidance: string;
  task: string;
  owner: string;
  officialLanguage: string;
}

const requirements: Requirement[] = [
  {
    section: "§ 95491.1(a)",
    regulation: "Record Retention",
    guidance: "Keep all LCFS records for 10 years and be able to hand them over within 20 days if CARB asks.",
    task: "☐ Central archive of LCFS docs (10‑year retention)\n☐ Written 20‑day retrieval SOP",
    owner: "",
    officialLanguage: "Any record required to be maintained under this subarticle shall be retained for ten years. All data and calculations submitted by a regulated entity for demonstrating compliance, or generating credits or deficits are subject to inspection by the Executive Officer or a verification body accredited by the Executive Officer pursuant to section 95502, and must be made available within 20 days upon request of the Executive Officer."
  },
  {
    section: "§ 95491.1(c)",
    regulation: "Monitoring Plan",
    guidance: "",
    task: "",
    owner: "",
    officialLanguage: "(c) Monitoring Plan for Entities Required to Validate or Verify. Each entity responsible for obtaining a validation or verification statement under this subarticle must complete and retain for review by a verifier, or the Executive Officer, a written Monitoring Plan. Entities also reporting pursuant to MRR may use a single monitoring plan for both programs, so long as all of the following elements are included and clearly identified"
  },
  {
    section: "§ 95491.1(c)(1)(A)",
    regulation: "Monitoring Plan",
    guidance: "Add an overview section: facility name, FPCs, location, flow chart, and list any RFS, IRS 45Q or other audits.",
    task: "☐ Process‑flow diagrams\n☐ Table of other compliance programs\n☐ Site & pathway summary page",
    owner: "",
    officialLanguage: "(A) Information to allow CARB and the verification team to develop a general understanding of boundaries and operations relevant to the entity, facility, or project, including participation in other markets and other third-party audit programs;"
  },
  {
    section: "§ 95491.1(c)(1)(B)",
    regulation: "Monitoring Plan",
    guidance: "Point to your QA manual, data‑retention policy, and SOP numbers.",
    task: "☐ Policy index with doc IDs\n☐ Latest revision dates logged",
    owner: "",
    officialLanguage: "(B) Reference to management policies or practices applicable to reporting pursuant to this subarticle, including recordkeeping;"
  },
  {
    section: "§ 95491.1(c)(1)(C)",
    regulation: "Monitoring Plan",
    guidance: "Describe how every LCFS data point is captured, and keep a change log since 2019.",
    task: "☐ Data‑flow narrative\n☐ Change‑log table",
    owner: "",
    officialLanguage: "(C) Explanation of the processes and methods used to collect necessary data for reporting pursuant to this subarticle, including identification of changes made after January 1, 2019;"
  },
  {
    section: "§ 95491.1(c)(1)(D)",
    regulation: "Monitoring Plan",
    guidance: "Show the SQL/look‑ups or spreadsheets that roll raw meter data into quarterly totals.",
    task: "☐ Query scripts or pivot‑table screenshots attached",
    owner: "",
    officialLanguage: "(D) Explanations and queries of source data to compile summary reports of intermediate and final data necessary for reporting pursuant to this subarticle;"
  },
  {
    section: "§ 95491.1(c)(1)(E)",
    regulation: "Monitoring Plan",
    guidance: "Insert a PFD‑style schematic highlighting every LCFS‑meter and sampling point.",
    task: "☐ Diagram in PDF\n☐ Legend for tag numbers",
    owner: "",
    officialLanguage: "(E) Reference to one or more simplified block diagrams that provide a clear visual representation of the relative locations and positions of measurement devices and sampling locations, as applicable, required for calculating reported data (e.g., temperature, total pressure, LHV or HHV, fuel consumption); the diagram(s) must include storage tanks for raw material, intermediate products, and finished products, fuel sources, combustion units, and production processes, as applicable;"
  },
  {
    section: "§ 95491.1(c)(1)(F)",
    regulation: "Monitoring Plan",
    guidance: "Build a meter inventory table (tag, range, low‑flow cut‑off, data path).",
    task: "☐ Meter list complete\n☐ Low‑flow rules documented",
    owner: "",
    officialLanguage: "(F) Clear identification of all measurement devices supplying data necessary for reporting pursuant to this subarticle, including identification of low flow cutoffs as applicable, with descriptions of how data from measurement devices are incorporated into the submitted report;"
  },
  {
    section: "§ 95491.1(c)(1)(G)",
    regulation: "Monitoring Plan",
    guidance: "Cite calibration certificates, MRR‑compliant financial‑transaction meters, or OEM specs.",
    task: "☐ Calibration schedule in table\n☐ OEM accuracy sheets on file",
    owner: "",
    officialLanguage: "(G) Descriptions of measurement devices used to report LCFS data and how acceptable accuracy is demonstrated, e.g., installation, maintenance, and calibration method and frequency for internal meters or how the criteria in MRR section 95103(k)(7) are met to demonstrate meters are financial transaction meters such that the accuracy is acceptable; this provision does not apply to data reported in the LRT-CBTS for generating credits for EV charging;"
  },
  {
    section: "§ 95491.1(c)(1)(H)",
    regulation: "Monitoring Plan",
    guidance: "Reference QA/QC SOPs for meters & lab tests.",
    task: "☐ QA SOP numbers linked\n☐ Preventive‑maintenance log",
    owner: "",
    officialLanguage: "(H) Description of the procedures and methods that are used for quality assurance, maintenance, and repair of all continuous monitoring systems, flow meters, and other instrumentation used to provide data for LCFS reports;"
  },
  {
    section: "§ 95491.1(c)(1)(I)",
    regulation: "Monitoring Plan",
    guidance: "Keep PDFs/manuals in the plan appendix or in a hyper‑linked folder.",
    task: "☐ OEM manuals stored & linked",
    owner: "",
    officialLanguage: "(I) Original equipment manufacturer (OEM) documentation or other documentation that identifies instrument accuracy and required maintenance and calibration requirements for all measurement devices used to collect necessary data for reporting pursuant to this subarticle;"
  },
  {
    section: "§ 95491.1(c)(1)(J)",
    regulation: "Monitoring Plan",
    guidance: "Add a live calibration calendar (last/next date) for each meter.",
    task: "☐ Calibration table updated",
    owner: "",
    officialLanguage: "(J) The dates of measurement device calibration or inspection, and the dates of the next required calibration or inspection;"
  },
  {
    section: "§ 95491.1(c)(1)(K)",
    regulation: "Monitoring Plan",
    guidance: "If you ever defer a calibration, file CARB approval letters here.",
    task: "☐ Deferment letters (if any)",
    owner: "",
    officialLanguage: "(K) Requests for postponement of calibrations or inspections of internal meters and subsequent approvals by the Executive Officer. The entity must demonstrate that the accuracy of the measured data will be maintained pursuant to the measurement accuracy requirements of 95488.8(j);"
  },
  {
    section: "§ 95491.1(c)(1)(L)",
    regulation: "Monitoring Plan",
    guidance: "Paste the exact equations or Excel cell refs you use, plus transport‑distance math.",
    task: "☐ Equation list vetted\n☐ Distance‑calc worksheet attached",
    owner: "",
    officialLanguage: "(L) A listing of the equation(s) used to calculate flows in mass, volume, or energy units of measurement, and equations from which any non-measured parameters are obtained, including meter software, and a description of the calculation of weighted average transport distance;"
  },
  {
    section: "§ 95491.1(c)(1)(M)",
    regulation: "Monitoring Plan",
    guidance: "Include an org chart + training matrix (who signs data, trainings completed).",
    task: "☐ Org chart dated\n☐ Training records cross‑referenced",
    owner: "",
    officialLanguage: "(M) Identification of job titles and training practices for key personnel involved in LCFS data acquisition, monitoring, reporting, and report attestation, including reference to documented training procedures and training materials;"
  },
  {
    section: "§ 95491.1(c)(1)(N)",
    regulation: "Monitoring Plan",
    guidance: "Maintain a CAPA log and show closure evidence.",
    task: "☐ CAPA tracker current",
    owner: "",
    officialLanguage: "(N) Records of corrective and subsequent preventative actions taken to address verifier and CARB findings of past nonconformance and material misstatements;"
  },
  {
    section: "§ 95491.1(c)(1)(O)",
    regulation: "Monitoring Plan",
    guidance: "Keep a version‑controlled change log whenever you edit the AFPR/QFTR.",
    task: "☐ FP report change log",
    owner: "",
    officialLanguage: "(O) Log of modifications to fuel pathway report conducted after attestation in response to review by third-party verifier or CARB staff;"
  },
  {
    section: "§ 95491.1(c)(1)(P)",
    regulation: "Monitoring Plan",
    guidance: "If you self‑audit LCFS data, summarize scope/frequency and file last audit report.",
    task: "☐ Internal‑audit SOP\n☐ Last audit report attached",
    owner: "",
    officialLanguage: "(P) Written description of an internal audit program that includes data report review and documents ongoing efforts to improve the entity's LCFS reporting practices and procedures, if such an internal audit program exists; and"
  },
  {
    section: "§ 95491.1(c)(1)(Q)",
    regulation: "Monitoring Plan",
    guidance: "State which CARB‑approved allocation formula you use (or cite Guidance 19‑08 §3).",
    task: "☐ Allocation method narrative\n☐ Worked example",
    owner: "",
    officialLanguage: "(Q) Methodology used to allocate the produced fuel quantity to each certified FPC."
  }
];

function RequirementsPage() {
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await api.get<UserListResponse>('/user-mgt/v2/list-details/');
    setUsers([...response?.data?.active_users, ...response?.data?.inactive_users]);
  }


  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">LCFS Requirements</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Progress:</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Section</TableHead>
              <TableHead className="w-[150px]">Regulation</TableHead>
              <TableHead>Guidance</TableHead>
              <TableHead className="w-[300px]">Tasks</TableHead>
              <TableHead className="w-[100px]">Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requirements.map((req, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <Popover>
                    <PopoverTrigger className="hover:text-blue-600 cursor-pointer">
                      {req.section}
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-4">
                      <h4 className="font-medium mb-2">Official Language</h4>
                      <p className="text-sm text-gray-600">{req.officialLanguage}</p>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>{req.regulation}</TableCell>
                <TableCell>
                  <p className="text-sm text-gray-600">{req.guidance}</p>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {req.task.split('\n').map((task, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Checkbox id={`task-${index}-${i}`} />
                        <label
                          htmlFor={`task-${index}-${i}`}
                          className="text-sm text-gray-700"
                        >
                          {task.replace('☐', '').trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Select defaultValue={req.owner}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Select owner">
                        {req.owner ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{users.find(u => u.id === req.owner)?.first_name || req.owner}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Unassigned</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{user.first_name} {user.last_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
} 

export default RequirementsPage;