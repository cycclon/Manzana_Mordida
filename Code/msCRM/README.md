# CRM MICROSERVICE SPECIFICATION

## DESCRIPTION
Microservice to manage CRM for apple product sales.
The endpoints will be mainly used by an n8n AI agent that will receive requests on social media like Instagram, Facebook, Whatsapp, etc., but also, the human sales person will use this endpoints thought a web front end.

## ARCHITECTURE
Node.Js Express Mongoose JSONWebToken

## FUNCTIONALITY

* Create a new CRM record: When a customer contacts us. Start with status Nuevo lead (new lead).
* Change status: when the agent considers that the customer is advancing in interest, will change the status according to the status flow. Everytime the status changes, the date of the change should be saved in the CRM record.
* Edit CRM:
    * Customer interests
    * Date of last contact
    * Bought device
    * Human needed status (When the AI can't answer a question and a human needs to take on the conversation)
* List CRMs by:
    * Username
    * CRM status
    * CRM id
    * All records