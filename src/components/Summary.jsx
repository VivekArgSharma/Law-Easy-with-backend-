import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import Loader from './Loader'
import './Summary.css'
import { useNavigate } from "react-router-dom";
const apiKey = import.meta.env.VITE_API_KEY;


function Summary({file}) {

  const genAI = new GoogleGenerativeAI(apiKey);
  const genAI2 = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });
  const model2 = genAI2.getGenerativeModel({ model: 'models/gemini-2.5-pro' });
  const [summary,setSummary] = useState("");
  const [status, setStatus] = useState("idle");
  const [probstatus, setProbStatus] = useState("idle");
  const [problems,setProblems] = useState("");
 
  async function getSummary(){
    setStatus('loading');

    try {
      const result = await model.generateContent([
        {
            inlineData: {
                data: file.file,
                mimeType: file.type,
            },
        },
        `
        You are an expert in Indian legal documents.  
Your task is to analyze any given legal document and produce a clear, detailed explanation in simple language.  

### Step 1: Identify the type of document
Classify the document into one of the following categories:
1. Personal Legal Document  
2. Property & Real Estate Document  
3. Business & Commercial Document  
4. Court & Litigation Document  
5. Taxation & Financial Document  
6. Intellectual Property Document  
7. Government & Regulatory Document  

### Step 2: Summarize using a hybrid style
- Use **paragraphs** to explain meaning, context, and importance.  
- Use **bullet points** when listing key details for clarity.  
- Always keep language simple, but cover all important legal aspects.  

### Step 3: Cover the key points for the detected category
For each category, make sure to address the following:  

**Personal Legal Documents**  
- Name of the person(s) concerned.  
- Date of issue / validity (if applicable).  
- Issuing authority (Municipality, UIDAI, Passport office, etc.).  
- What fact/status it certifies (birth, marriage, identity, etc.).  
- Where and how it can be used (govt services, legal proof, banking, etc.).  
- Why it is important legally.  

**Property & Real Estate Documents**  
- Names of parties (buyer/seller, lessor/lessee, donor/recipient).  
- Nature of transaction (sale, lease, mortgage, gift, inheritance).  
- Description of property (location, size, type).  
- Consideration (price/rent/loan amount if applicable).  
- Rights and obligations transferred.  
- Registration details (stamp duty, Sub-Registrar’s office).  
- Why it is legally enforceable.  

**Business & Commercial Documents**  
- Parties involved (partners, employer/employee, companies).  
- Type of agreement (partnership, NDA, employment, franchise, loan, etc.).  
- Key rights and obligations of each side.  
- Duration / validity of the agreement.  
- Governing law / jurisdiction (if mentioned).  
- How it protects parties legally.  

**Court & Litigation Documents**  
- Court name and type (civil, criminal, high court, etc.).  
- Parties involved (plaintiff/defendant, petitioner/respondent).  
- Nature of the case (dispute, criminal charge, writ petition, etc.).  
- Relief sought / allegation made.  
- Court’s order, decree, or judgment (if given).  
- Current status (pending, decided, execution).  
- Legal importance.  

**Taxation & Financial Documents**  
- Name and details of taxpayer (PAN, GSTIN, etc.).  
- Period/year of assessment.  
- Type of tax/finance involved (income tax, GST, property tax, loan).  
- Amount declared, paid, or due.  
- Issuing authority (Income Tax Dept, GST authority, Municipality, Bank).  
- Proof value (for compliance, loans, audits).  
- Why it is important.  

**Intellectual Property Documents**  
- Name of applicant/owner.  
- Type of IP (patent, copyright, trademark, design).  
- Subject matter (invention, logo, literary work, product design).  
- Registration number and date.  
- Duration/validity of protection.  
- Rights granted (exclusive use, right to prevent infringement).  
- Why it is important.  

**Government & Regulatory Documents**  
- Name of licensee/organization.  
- License/permit type (trade, FSSAI, pollution clearance, PF/ESI registration).  
- Issuing authority (municipality, government dept, regulatory body).  
- Purpose of license (business operation, compliance).  
- Validity period / renewal requirements.  
- Conditions/restrictions (if any).  
- Legal significance.  

### Step 4: Output format
- Begin with: “This document is a [TYPE]”  
- Provide a **paragraph-style explanation** of what it means and why it matters.  
- Use **bullet points** for structured details based on the above category points.  
- End with a concluding note in simple words: “In short, this document serves as…”  


        `,
      ]);
      setStatus('success');
      setSummary(result.response.text());
    } catch (error) {
      setStatus('error');
    }
  }

  async function getproblems(){
    setProbStatus('loading');

    try {
      const result = await model.generateContent([
        {
            inlineData: {
                data: file.file,
                mimeType: file.type,
            },
        },
        `
        You are a legal assistant AI that analyzes Indian legal documents. Your task is to carefully read the document, identify potential risks/issues, and present them in a simple but detailed way so that a non-lawyer can understand.

Steps to follow:

Identify the document type (e.g., Contract, Employment Agreement, Lease, Will, Loan Agreement, Partnership Deed, Sale Deed, Power of Attorney, Privacy Policy, Terms & Conditions, MoU, Affidavit, Legal Notice, Court Order, Insurance Policy, Service Agreement).

Summarize the document in clear, simple paragraphs explaining its purpose and key clauses.

Risk & Issue Detection → Scan for and highlight risks such as:

Contracts & Agreements → Unclear obligations, penalty clauses, one-sided termination, hidden fees, arbitration bias.

Employment Agreements → Non-compete restrictions, unfair termination, salary withholding, overtime ambiguity, unclear benefits.

Lease/Rent Agreements → Sudden eviction clauses, rent hike terms, repair liability, hidden maintenance costs.

Wills & Testamentary Documents → Ambiguous beneficiaries, invalid execution, exclusion of legal heirs, unclear executor powers.

Loan Agreements → High hidden fees, prepayment penalties, default clauses, collateral seizure rights.

Partnership Deeds → Unequal profit-sharing, vague partner exit clauses, dispute settlement gaps.

Sale Deeds → Missing ownership warranties, hidden liabilities, unclear possession handover, stamp duty issues.

Power of Attorney → Broad powers without limits, misuse risk, revocation issues.

Privacy Policies / T&Cs → Unclear data usage, auto-renewals, no refund policy, jurisdiction bias.

Insurance Policies → Ambiguous coverage, hidden exclusions, claim rejection loopholes.

Court Orders / Legal Notices / Affidavits → Compliance timelines, penalties, enforceability doubts.

Rank Risks by Severity & Impact → Present findings like this:

🔴 High Risk: Critical clauses that can cause financial/legal harm.

🟡 Medium Risk: Potentially unfair but negotiable clauses.

🟢 Low Risk: Minor inconveniences or small fees.

Explain Each Risk in Simple Language → For every risk, explain what it means and how it could affect the person.

Visual Risk Map (Overall Fairness Score):

Show % of fairness, medium risk, and high risk.

Example: “This contract is 60% fair, 25% medium risk, 15% high risk.”
        `,
      ]);
      setProbStatus('success');
      setProblems(result.response.text());
    } catch (error) {
      setProbStatus('error');
    }
  }

  useEffect(()=>{
    if(status === 'idle'){
      getSummary();
    }
  },[status]);

  useEffect(()=>{
    if(probstatus === 'idle'){
      getproblems();
    }
  },[probstatus]);


  return ( 
    <section className="summary">
      <div className="img-container">
        <img src={file.imageUrl} alt="Preview Image" className="img-char"/>
      </div>
      <div className="summary-problems">

        <div className="template-preview">
          <h2>Summary</h2>
          {
            status === 'loading' ?
            <Loader /> :
            status === 'success' ?
            <pre>{summary}</pre> :
            status === 'error' ?
            <p>Error getting the summary</p> :
            ''
          }
        </div>

        <div className="template-preview">
          <h2>Issues</h2>
          {
            probstatus === 'loading' ?
            <Loader /> :
            probstatus === 'success' ?
            <pre>{problems}</pre> :
            probstatus === 'error' ?
            <p>Error finding the issues in the document</p> :
            ''
          }
        </div>

      </div>      
    </section> 
  )
}
  
export default Summary
