package com.zangho.game.server.repository.visit;

import com.zangho.game.server.domain.Visit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.datasource.DataSourceUtils;

import javax.sql.DataSource;
import java.sql.*;

public class VisitRepository {


    private final DataSource visitDataSource;
    private Logger logger = LoggerFactory.getLogger(VisitRepository.class);

    public VisitRepository(@Qualifier("visitDataSource")DataSource visitDataSource) {
        this.visitDataSource = visitDataSource;
    }

    public boolean save(Visit visit) {
        var sql = "call x_saveVisit(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = getConnection();
            pstmt = conn.prepareCall(sql);

            pstmt.setString(1, visit.getSession());
            pstmt.setLong(2, visit.getFp());
            pstmt.setString(3, visit.getDeviceType());
            pstmt.setString(4, visit.getDeviceVendor());
            pstmt.setString(5, visit.getDeviceModel());
            pstmt.setString(6, visit.getAgent());
            pstmt.setString(7, visit.getBrowser());
            pstmt.setString(8, visit.getBrowserVersion());
            pstmt.setString(9, visit.getEngine());
            pstmt.setString(10, visit.getEngineVersion());
            pstmt.setString(11, visit.getOs());
            pstmt.setString(12, visit.getOsVersion());
            pstmt.setString(13, visit.getHost());
            pstmt.setString(14, visit.getIp());
            pstmt.setString(15, visit.getParameter());
            pstmt.setString(16, visit.getPath());
            pstmt.setInt(17, visit.getScheme());
            pstmt.setString(18, visit.getTitle());
            pstmt.setTimestamp(19, new Timestamp(visit.getLocalTime().getTime()));

            pstmt.execute();
            rs = pstmt.getResultSet();

            if (rs.next()) {
                return rs.getBoolean(1);
            } else {
                return false;
            }

        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return false;
        } finally {
            close(conn, pstmt, rs);
        }
    }

    private void logBytePackets(byte[] packet, String name) throws Exception {

        var packetString = new StringBuilder();
        packetString.append(name).append("[").append(packet.length).append("]").append(":");

        for (var i = 0; i < packet.length; i++) {
            var b = packet[i];
            packetString.append(" (").append(i).append(")").append(b);
        }

        logger.info(packetString.toString());
    }

    private Connection getConnection() {
        return DataSourceUtils.getConnection(visitDataSource);
    }

    private void close(Connection conn, PreparedStatement pstmt, ResultSet rs) {

        try {
            if (rs != null) {
                rs.close();
            }
        } catch (SQLException ex) {
            logger.error(ex.getMessage(), ex);
        }

        try {
            if (pstmt != null) {
                pstmt.close();
            }
        } catch (SQLException ex) {
            logger.error(ex.getMessage(), ex);
        }

        try {
            if (conn != null) {
                close(conn);
            }
        } catch (SQLException ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    private void close(Connection conn) throws SQLException {
        DataSourceUtils.releaseConnection(conn, visitDataSource);
    }
}
