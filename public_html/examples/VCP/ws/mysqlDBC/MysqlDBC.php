<?php

/**
 * Description of MysqlDBC
 * Clase que provee la conexion directa a la base de datos mysql
 * utilizando las libreria de mysqli que provee php
 * 
 * @author Rodrigo
 */
class MysqlDBC {

    private $connection; // mysql connection
    private $url;
    private $username;
    private $password;
    private $name;

    function __construct($url, $username, $password, $name) {
        $this->url = $url;
        $this->username = $username;
        $this->password = $password;
        $this->name = $name;
        //$this->connect();
    }

    // mysqli connection
    public function connect() {
        $this->connection = mysqli_connect($this->url, $this->username, $this->password, $this->name)
                or $this->mysqlError();
    }
    
    public function getResult($command) {
        $result = mysqli_query($this->connection, $command)
                or $this->mysqlErrorQuery($command);
        return $result;
    }
    
    public function getVar($var) {
        return $this->connection->real_escape_string($var);
    }

    public function insert($command) {
        mysqli_query($this->connection, $command)
                or $this->mysqlErrorQuery($command);
        return mysqli_insert_id($this->connection);
    }
    
    public function update($command) {
        mysqli_query($this->connection, $command)
                or $this->mysqlErrorQuery($command);
        return mysqli_affected_rows($this->connection);
    }
    
    public function delete($command) {
        mysqli_query($this->connection, $command)
                or $this->mysqlErrorQuery($command);
        return mysqli_affected_rows($this->connection);
    }

    public function mysqlError() {
        Error::sendError(Error::DatabaseC, 
                mysqli_connect_errno(), "Error de conexion:" . mysqli_connect_error());
        die;
    }
    
    public function mysqlErrorQuery($command) {
        Error::sendError(Error::DatabaseC, 
                mysqli_errno($this->connection), mysqli_error($this->connection).":'$command'");
        mysqli_close($this->connection);
        die;
    }
}

?>
