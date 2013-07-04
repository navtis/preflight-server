<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet version="1.0"
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:param name="filename2"/> 

  <xsl:template match="preflight">
          <preflight>
                  <xsl:apply-templates select="./*"/>
                  <xsl:apply-templates select="document($filename2)/*"/> 
          </preflight>
</xsl:template>


<xsl:template match="@*|node()"> 
    <xsl:copy> 
        <xsl:apply-templates select="@*|node()"/> 
    </xsl:copy> 
</xsl:template>

</xsl:stylesheet>
