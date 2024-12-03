CREATE OR REPLACE FUNCTION get_templates_by_user(p_user_uuid UUID) 
RETURNS TABLE (
    template_id UUID,
    template_name VARCHAR,
    template_owner_id UUID,
    is_private BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.template_id,
        t.template_name,
        t.template_owner_id,
        t.private
    FROM templates t
    WHERE 
        (t.private = FALSE OR t.template_owner_id = p_user_uuid);
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT * FROM get_templates_by_user('123e4567-e89b-12d3-a456-426614174000');
