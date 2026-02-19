# **Import Steps**

### **Step 1 — Prepare the Data**

1. Download the provided ZIP file(SFRA Implementation.zip).
2. Extract (decompress) it.  
3. Note the **folder path** of the extracted content.

**Step 2 — Create Target Stack**

1. Login to Contentstack (browser).  
2. Create a **new Stack** where data will be imported.  
3. Copy the **Stack API Key** (you will need it later).

### **Step 3 — Install CLI**

Open Terminal and run: **npm install \-g @contentstack/cli**

### **Step 4 — Set Region**

Run the command based on your stack region: **csdx config:set:region AWS-NA**.  
(Use EU / AZURE-NA / AZURE-EU if your stack belongs to those regions.)

### **Step 5 — Login**

Run: **csdx auth:login \-u \<\<[yourmail@youremailprovider.com](mailto:yourmail@contentstack.com)\>\>**

Enter your password of Contentstack app.  
Complete 2FA (if enabled).  
On success, you will see:  
SUCCESS: Successfully logged in

**Step 6 — Start Import**

Run: **csdx cm:stacks:import \-k \<{{TARGET\_STACK\_API\_KEY\_COPIED\_FROM\_STEP2.3}}\>** 

**Step 7 — Provide Import Details**

Do the below actions When prompted:

1. Prompt: **Enter the path for the content**  
   Action:  
   Enter the extracted folder path (main folder) copied from Step 1.3.  
   Example: /Users/Projects/YourFolder/SFRA Implementation/main  
2. Prompt: **Please review and confirm if we can proceed with implementing the fix mentioned in the provided path.**   
   Action: If the fix is right, then write **yes** and press **Enter**

3. Prompt: **Enter Marketplace app configurations encryption key \<\<bydefault key\>\>**  
   Action: Press **Enter**.

**Step 8 — Verify Marketplace App**

1. Go to Contentstack → Marketplace  
2. Search **Salesforce Commerce** App  
3. Open Configurations against the new stack where we have imported now.  
4. Click Save (to reinitialize configuration)

Your import is now complete ✅