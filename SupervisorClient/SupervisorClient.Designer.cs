namespace Supervisor.Client
{
    partial class SupervisorClient
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(SupervisorClient));
            PatchButton = new System.Windows.Forms.Button();
            ServerListComboBox = new System.Windows.Forms.ComboBox();
            ProjectPathTextBox = new System.Windows.Forms.TextBox();
            PatchProgressBar = new System.Windows.Forms.ProgressBar();
            StartServerButton = new System.Windows.Forms.Button();
            StopServerButton = new System.Windows.Forms.Button();
            IncludeFolderCheckedListBox = new System.Windows.Forms.CheckedListBox();
            InstallNPMPackageButton = new System.Windows.Forms.Button();
            SuspendLayout();
            // 
            // PatchButton
            // 
            PatchButton.Location = new System.Drawing.Point(319, 95);
            PatchButton.Name = "PatchButton";
            PatchButton.Size = new System.Drawing.Size(150, 30);
            PatchButton.TabIndex = 2;
            PatchButton.Text = "패치하기";
            PatchButton.UseVisualStyleBackColor = true;
            PatchButton.Click += PatchButton_Click;
            // 
            // ServerListComboBox
            // 
            ServerListComboBox.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            ServerListComboBox.FormattingEnabled = true;
            ServerListComboBox.Location = new System.Drawing.Point(7, 8);
            ServerListComboBox.Name = "ServerListComboBox";
            ServerListComboBox.Size = new System.Drawing.Size(462, 23);
            ServerListComboBox.TabIndex = 4;
            ServerListComboBox.SelectedIndexChanged += ServerListComboBox_SelectedIndexChanged;
            // 
            // ProjectPathTextBox
            // 
            ProjectPathTextBox.Location = new System.Drawing.Point(7, 37);
            ProjectPathTextBox.Name = "ProjectPathTextBox";
            ProjectPathTextBox.Size = new System.Drawing.Size(462, 23);
            ProjectPathTextBox.TabIndex = 7;
            ProjectPathTextBox.TextChanged += ProjectTextBoxChanged;
            ProjectPathTextBox.LostFocus += ProjectTextBoxLostFocus;
            // 
            // PatchProgressBar
            // 
            PatchProgressBar.Location = new System.Drawing.Point(7, 66);
            PatchProgressBar.Name = "PatchProgressBar";
            PatchProgressBar.Size = new System.Drawing.Size(462, 23);
            PatchProgressBar.Step = 1;
            PatchProgressBar.TabIndex = 9;
            PatchProgressBar.Click += PatchProgressBar_Click;
            // 
            // StartServerButton
            // 
            StartServerButton.Location = new System.Drawing.Point(319, 128);
            StartServerButton.Name = "StartServerButton";
            StartServerButton.Size = new System.Drawing.Size(150, 30);
            StartServerButton.TabIndex = 10;
            StartServerButton.Text = "서버 시작";
            StartServerButton.UseVisualStyleBackColor = true;
            StartServerButton.Click += StartServerButton_Click;
            // 
            // StopServerButton
            // 
            StopServerButton.Location = new System.Drawing.Point(319, 162);
            StopServerButton.Name = "StopServerButton";
            StopServerButton.Size = new System.Drawing.Size(150, 30);
            StopServerButton.TabIndex = 11;
            StopServerButton.Text = "서버 종료";
            StopServerButton.UseVisualStyleBackColor = true;
            StopServerButton.Click += StopServerButton_Click;
            // 
            // IncludeFolderCheckedListBox
            // 
            IncludeFolderCheckedListBox.CheckOnClick = true;
            IncludeFolderCheckedListBox.FormattingEnabled = true;
            IncludeFolderCheckedListBox.Location = new System.Drawing.Point(7, 95);
            IncludeFolderCheckedListBox.Name = "IncludeFolderCheckedListBox";
            IncludeFolderCheckedListBox.Size = new System.Drawing.Size(306, 130);
            IncludeFolderCheckedListBox.TabIndex = 12;
            // 
            // InstallNPMPackageButton
            // 
            InstallNPMPackageButton.Location = new System.Drawing.Point(319, 195);
            InstallNPMPackageButton.Name = "InstallNPMPackageButton";
            InstallNPMPackageButton.Size = new System.Drawing.Size(150, 30);
            InstallNPMPackageButton.TabIndex = 13;
            InstallNPMPackageButton.Text = "패키지 설치";
            InstallNPMPackageButton.UseVisualStyleBackColor = true;
            InstallNPMPackageButton.Click += InstallNPMPackageButton_Click;
            // 
            // SupervisorClient
            // 
            AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            ClientSize = new System.Drawing.Size(476, 234);
            Controls.Add(InstallNPMPackageButton);
            Controls.Add(IncludeFolderCheckedListBox);
            Controls.Add(StopServerButton);
            Controls.Add(StartServerButton);
            Controls.Add(PatchProgressBar);
            Controls.Add(ProjectPathTextBox);
            Controls.Add(ServerListComboBox);
            Controls.Add(PatchButton);
            Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
            KeyPreview = true;
            Name = "SupervisorClient";
            Text = "SupervisorClient";
            KeyDown += ShortCut;
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion
        private System.Windows.Forms.Button PatchButton;
        private System.Windows.Forms.ComboBox ServerListComboBox;
        private System.Windows.Forms.TextBox ProjectPathTextBox;
        private System.Windows.Forms.ProgressBar PatchProgressBar;
        private System.Windows.Forms.Button StartServerButton;
        private System.Windows.Forms.Button StopServerButton;
        private System.Windows.Forms.CheckedListBox IncludeFolderCheckedListBox;
        private System.Windows.Forms.Button InstallNPMPackageButton;
    }
}
