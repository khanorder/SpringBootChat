namespace Supervisor.Models
{
    public enum ClientReq
    {
        StopServer,
        StartServer,
        Unzip,
        InstallNPMPackage,
        Test
    }

    public enum ServerAck
    {
        StopServer,
        StartServer,
        Unzip,
        InstallNPMPackage,
        Test
    }

    public enum ServerServiceMode
    {
        Start,
        Stop,
        Status
    }

    public enum IncludeFolder
    {
        css,
        js,
        images,
        videos,
        audios,
        fonts,
        lib,
        scripts,
        navmenusettings,
        jwtsettings,
    }

    public enum ServerOS
    {
        None,
        Linux,
        Windows
    }

    public enum ServiceType
    {
        Native,
        IIS
    }

    public enum ProjectType
    {
        DotNet,
        NodeJS,
        SpringBoot
    }
}
