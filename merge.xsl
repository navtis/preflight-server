<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet version="1.0"
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="preflight">
          <preflight>
                  <xsl:apply-templates select="@* | node()"/>
          </preflight>
</xsl:template>

<xsl:template match="fido_output">
        <fido_output>
                <xsl:apply-templates select="@* | node()"/>
        </fido_output>
</xsl:template>

<xsl:template match="@* | node()"> 
    <xsl:copy> 
        <xsl:apply-templates select="@* | node()"/> 
    </xsl:copy> 
</xsl:template>

</xsl:stylesheet>
